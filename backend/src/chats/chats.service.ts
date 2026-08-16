import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import type {UIMessage} from 'ai';
import {randomUUID} from 'node:crypto';
import {Repository} from 'typeorm';
import type {Chat, ChatVote, UpdateChatInput} from '@recovery-assistant/shared';
import {ChatEntity, MessageEntity, MessageVoteEntity,} from '../database/entities';
import {getUser} from '../common/user-context';

type ChatResult = Omit<Chat<UIMessage>, 'createdAt'> & { createdAt: Date };

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(ChatEntity) private readonly chats: Repository<ChatEntity>,
    @InjectRepository(MessageEntity) private readonly messages: Repository<MessageEntity>,
    @InjectRepository(MessageVoteEntity) private readonly votes: Repository<MessageVoteEntity>,
  ) {}

  async list(): Promise<ChatEntity[]> {
    return await this.chats.find({
      where: {userId: getUser().id},
      order: {updatedAt: 'DESC'},
    });
  }

  async create(input?: string): Promise<ChatResult> {
    const chat = this.chats.create({
      id: randomUUID(),
      userId: getUser().id,
      title: null,
      createdBy: getUser().id,
      updatedBy: getUser().id,
      deletedBy: null,
    });

    await this.chats.manager.transaction(async (manager) => {
      await manager.getRepository(ChatEntity).save(chat);

      if (input) {
        await manager.getRepository(MessageEntity).save({
          id: randomUUID(),
          chatId: chat.id,
          role: 'user',
          parts: [{ type: 'text', text: input }],
          metadata: null,
          sequence: 0,
            createdBy: getUser().id,
            updatedBy: getUser().id,
          deletedBy: null,
        });
      }
    });

    return this.toChat(chat);
  }

  async get(id: string): Promise<ChatResult> {
    return this.toChat(await this.requireChat(id));
  }

  async getTitle(id: string): Promise<string | null> {
    return (await this.requireChat(id)).title;
  }

  async saveGeneratedTitle(id: string, title: string): Promise<void> {
    await this.chats
      .createQueryBuilder()
      .update(ChatEntity)
      .set({ title, updatedBy: getUser().id })
      .where('id = :id AND user_id = :userId AND title IS NULL', { id, userId: getUser().id })
      .execute();
  }

  async update(id: string, update: UpdateChatInput): Promise<ChatResult> {
    const chat = await this.requireChat(id);

    if (update.title !== undefined) chat.title = update.title;
    chat.updatedBy = getUser().id;

    return this.toChat(await this.chats.save(chat));
  }

  async remove(id: string): Promise<void> {
    const result = await this.chats
      .createQueryBuilder()
      .update(ChatEntity)
      .set({ deletedAt: new Date(), deletedBy: getUser().id, updatedBy: getUser().id })
      .where('id = :id AND user_id = :userId AND deleted_at IS NULL', { id, userId: getUser().id })
      .execute();

    if (result.affected !== 1) throw new NotFoundException('chat not found');
  }

  async listVotes(chatId: string): Promise<ChatVote[]> {
    await this.requireChat(chatId);
    const votes = await this.votes
      .createQueryBuilder('vote')
      .innerJoin(MessageEntity, 'message', 'message.id = vote.message_id AND message.deleted_at IS NULL')
      .where('vote.user_id = :userId', { userId: getUser().id })
      .andWhere('message.chat_id = :chatId', { chatId })
      .orderBy('vote.created_at', 'ASC')
      .getMany();

    return votes.map((vote) => ({
      chatId,
      messageId: vote.messageId,
      isUpvoted: vote.value === 1,
    }));
  }

  async setVote(chatId: string, messageId: string, isUpvoted?: boolean): Promise<void> {
    await this.requireMessage(chatId, messageId);
    const vote = await this.votes.findOne({
      where: { userId: getUser().id, messageId },
      withDeleted: true,
    });

    if (isUpvoted === undefined) {
      if (vote && !vote.deletedAt) await this.softDeleteVote(vote.id);
      return;
    }

    const entity = vote ?? this.votes.create({
      id: randomUUID(),
      userId: getUser().id,
      messageId,
      value: isUpvoted ? 1 : -1,
      createdBy: getUser().id,
      updatedBy: getUser().id,
      deletedBy: null,
    });
    entity.value = isUpvoted ? 1 : -1;
    entity.updatedBy = getUser().id;
    entity.deletedAt = null;
    entity.deletedBy = null;
    await this.votes.save(entity);

  }

  async removeMessage(chatId: string, messageId: string): Promise<void> {
    const message = await this.requireMessage(chatId, messageId);
    await this.messages
      .createQueryBuilder()
      .update(MessageEntity)
      .set({ deletedAt: new Date(), deletedBy: getUser().id, updatedBy: getUser().id })
      .where('chat_id = :chatId AND sequence >= :sequence AND deleted_at IS NULL', {
        chatId,
        sequence: message.sequence,
      })
      .execute();
  }

  async saveLatestUserMessage(chatId: string, messages: UIMessage[]): Promise<void> {
    const message = messages.at(-1);

    if (!message || message.role !== 'user') return;
    await this.saveMessage(chatId, { ...message, metadata: undefined });
  }

  async saveAssistantMessage(chatId: string, message: UIMessage): Promise<void> {
    await this.saveMessage(chatId, message, true);
  }

  async getMessages(chatId: string): Promise<UIMessage[]> {
    await this.requireChat(chatId);
    const messages = await this.messages.find({
      where: { chatId },
      order: { sequence: 'ASC' },
    });

    return messages.map(({ id, role, parts, metadata }) => ({ id, role, parts, metadata: metadata ?? undefined }));
  }

  private async requireChat(id: string): Promise<ChatEntity> {
    const chat = await this.chats.findOne({ where: { id, userId: getUser().id } });
    if (!chat) throw new NotFoundException('chat not found');
    return chat;
  }

  private async requireMessage(chatId: string, id: string): Promise<MessageEntity> {
    const message = await this.messages.findOne({ where: { id, chatId } });
    if (!message) throw new NotFoundException('message not found');
    return message;
  }

  /**
   * 保存一条 UI 消息。
   * 同一 messageId 已存在时更新并恢复软删除记录；否则按 sequence 追加到会话末尾。
   * 助手消息完成时会更新会话时间，确保会话列表按最新回复排序。
   */
  private async saveMessage(chatId: string, message: UIMessage, updateChatTimestamp = false): Promise<void> {
    await this.chats.manager.transaction(async (manager) => {
      const chatRepository = manager.getRepository(ChatEntity);
      const chat = await chatRepository.findOne({ where: { id: chatId, userId: getUser().id } });

      if (!chat) throw new NotFoundException('chat not found');

      const messageRepository = manager.getRepository(MessageEntity);
      const existingMessage = await messageRepository.findOne({
        where: { id: message.id },
        withDeleted: true,
      });

      if (existingMessage) {
        // 编辑或重试会复用 messageId，只允许更新当前会话中的消息。
        if (existingMessage.chatId !== chatId) throw new NotFoundException('message not found');
        if (existingMessage.role !== message.role) throw new NotFoundException('message not found');
        await messageRepository.save(messageRepository.merge(existingMessage, {
          role: message.role,
          parts: message.parts,
          metadata: message.metadata ?? null,
          updatedBy: getUser().id,
          deletedAt: null,
          deletedBy: null,
        }));
      } else {
        // 新消息取当前最后一条消息的下一位，保证展示与模型上下文的顺序稳定。
        const lastMessage = await messageRepository
          .findOne({
            where: { chatId },
            order: { sequence: 'DESC' },
            withDeleted: true,
          });

        await messageRepository.save(messageRepository.create({
          id: message.id,
          chatId,
          role: message.role,
          parts: message.parts,
          metadata: message.metadata ?? null,
          sequence: (lastMessage?.sequence ?? -1) + 1,
          createdBy: getUser().id,
          updatedBy: getUser().id,
          deletedBy: null,
        }));
      }

      if (updateChatTimestamp) {
        // 用户消息已在创建会话时更新时间；助手完成后再推动会话到列表顶部。
        chat.updatedBy = getUser().id;
        await chatRepository.save(chat);
      }
    });
  }

  private async softDeleteVote(id: string): Promise<void> {
    await this.votes
      .createQueryBuilder()
      .update(MessageVoteEntity)
      .set({ deletedAt: new Date(), deletedBy: getUser().id, updatedBy: getUser().id })
      .where('id = :id AND deleted_at IS NULL', { id })
      .execute();
  }

  private async toChat(chat: ChatEntity): Promise<ChatResult> {
    return {
      id: chat.id,
      title: chat.title,
      createdAt: chat.createdAt,
      messages: await this.getMessages(chat.id),
    };
  }
}
