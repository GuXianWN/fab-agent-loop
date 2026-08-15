import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { UIMessage } from 'ai';
import { randomUUID } from 'node:crypto';
import { Repository } from 'typeorm';
import {
  ChatEntity,
  DEMO_USER_ID,
  MessageEntity,
  MessageVoteEntity,
  type ChatVisibility,
} from '../database/entities';

export type { ChatVisibility } from '../database/entities';

export interface ChatVote {
  chatId: string;
  messageId: string;
  isUpvoted: boolean;
}

type ChatUpdate = {
  title?: string | null;
  visibility?: ChatVisibility;
};

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(ChatEntity) private readonly chats: Repository<ChatEntity>,
    @InjectRepository(MessageEntity) private readonly messages: Repository<MessageEntity>,
    @InjectRepository(MessageVoteEntity) private readonly votes: Repository<MessageVoteEntity>,
  ) {}

  async list() {
    const chats = await this.chats.find({
      where: { userId: DEMO_USER_ID },
      order: { updatedAt: 'DESC' },
    });

    return chats.map(({ id, title, createdAt }) => ({ id, title, createdAt }));
  }

  async create(input?: string) {
    const chat = this.chats.create({
      id: randomUUID(),
      userId: DEMO_USER_ID,
      title: null,
      visibility: 'private',
      model: 'deepseek-v4-flash',
      shareId: randomUUID(),
      createdBy: DEMO_USER_ID,
      updatedBy: DEMO_USER_ID,
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
          createdBy: DEMO_USER_ID,
          updatedBy: DEMO_USER_ID,
          deletedBy: null,
        });
      }
    });

    return this.toChat(chat);
  }

  async get(id: string) {
    return this.toChat(await this.requireChat(id));
  }

  async update(id: string, update: ChatUpdate) {
    const chat = await this.requireChat(id);

    if (update.title !== undefined) chat.title = update.title;
    if (update.visibility !== undefined) chat.visibility = update.visibility;
    chat.updatedBy = DEMO_USER_ID;

    return this.toChat(await this.chats.save(chat));
  }

  async remove(id: string): Promise<void> {
    const result = await this.chats
      .createQueryBuilder()
      .update(ChatEntity)
      .set({ deletedAt: new Date(), deletedBy: DEMO_USER_ID, updatedBy: DEMO_USER_ID })
      .where('id = :id AND user_id = :userId AND deleted_at IS NULL', { id, userId: DEMO_USER_ID })
      .execute();

    if (result.affected !== 1) throw new NotFoundException('chat not found');
  }

  async listVotes(chatId: string): Promise<ChatVote[]> {
    await this.requireChat(chatId);
    const votes = await this.votes
      .createQueryBuilder('vote')
      .innerJoin(MessageEntity, 'message', 'message.id = vote.message_id AND message.deleted_at IS NULL')
      .where('vote.user_id = :userId', { userId: DEMO_USER_ID })
      .andWhere('message.chat_id = :chatId', { chatId })
      .orderBy('vote.created_at', 'ASC')
      .getMany();

    return votes.map((vote) => ({
      chatId,
      messageId: vote.messageId,
      isUpvoted: vote.value === 1,
    }));
  }

  async setVote(chatId: string, messageId: string, isUpvoted?: boolean): Promise<ChatVote | undefined> {
    await this.requireMessage(chatId, messageId);
    const vote = await this.votes.findOne({
      where: { userId: DEMO_USER_ID, messageId },
      withDeleted: true,
    });

    if (isUpvoted === undefined) {
      if (vote && !vote.deletedAt) await this.softDeleteVote(vote.id);
      return undefined;
    }

    const entity = vote ?? this.votes.create({
      id: randomUUID(),
      userId: DEMO_USER_ID,
      messageId,
      value: isUpvoted ? 1 : -1,
      createdBy: DEMO_USER_ID,
      updatedBy: DEMO_USER_ID,
      deletedBy: null,
    });
    entity.value = isUpvoted ? 1 : -1;
    entity.updatedBy = DEMO_USER_ID;
    entity.deletedAt = null;
    entity.deletedBy = null;
    await this.votes.save(entity);

    return { chatId, messageId, isUpvoted };
  }

  async removeMessage(chatId: string, messageId: string): Promise<void> {
    const message = await this.requireMessage(chatId, messageId);
    await this.messages
      .createQueryBuilder()
      .update(MessageEntity)
      .set({ deletedAt: new Date(), deletedBy: DEMO_USER_ID, updatedBy: DEMO_USER_ID })
      .where('chat_id = :chatId AND sequence >= :sequence AND deleted_at IS NULL', {
        chatId,
        sequence: message.sequence,
      })
      .execute();
  }

  async saveLatestUserMessage(chatId: string, messages: UIMessage[]): Promise<void> {
    const message = messages.at(-1);

    if (!message || message.role !== 'user') return;
    await this.saveMessage(chatId, message);
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

    return messages.map(({ id, role, parts, metadata }) => ({ id, role, parts, metadata: metadata ?? undefined } as UIMessage));
  }

  private async requireChat(id: string): Promise<ChatEntity> {
    const chat = await this.chats.findOne({ where: { id, userId: DEMO_USER_ID } });
    if (!chat) throw new NotFoundException('chat not found');
    return chat;
  }

  private async requireMessage(chatId: string, id: string): Promise<MessageEntity> {
    const message = await this.messages.findOne({ where: { id, chatId } });
    if (!message) throw new NotFoundException('message not found');
    return message;
  }

  private async saveMessage(chatId: string, message: UIMessage, touchChat = false): Promise<void> {
    await this.chats.manager.transaction(async (manager) => {
      const chat = await manager
        .getRepository(ChatEntity)
        .createQueryBuilder('chat')
        .setLock('pessimistic_write')
        .where('chat.id = :id AND chat.user_id = :userId', { id: chatId, userId: DEMO_USER_ID })
        .getOne();

      if (!chat) throw new NotFoundException('chat not found');

      const messages = manager.getRepository(MessageEntity);
      const existing = await messages.findOne({ where: { id: message.id }, withDeleted: true });

      if (existing) {
        if (existing.chatId !== chatId) throw new NotFoundException('message not found');
        existing.role = message.role;
        existing.parts = message.parts;
        existing.metadata = message.metadata ?? null;
        existing.updatedBy = DEMO_USER_ID;
        existing.deletedAt = null;
        existing.deletedBy = null;
        await messages.save(existing);
      } else {
        const result = await messages
          .createQueryBuilder('message')
          .withDeleted()
          .select('COALESCE(MAX(message.sequence), -1)', 'sequence')
          .where('message.chat_id = :chatId', { chatId })
          .getRawOne<{ sequence: string }>();

        await messages.save(messages.create({
          id: message.id,
          chatId,
          role: message.role,
          parts: message.parts,
          metadata: message.metadata ?? null,
          sequence: Number(result?.sequence ?? -1) + 1,
          createdBy: DEMO_USER_ID,
          updatedBy: DEMO_USER_ID,
          deletedBy: null,
        }));
      }

      if (touchChat) {
        chat.updatedBy = DEMO_USER_ID;
        await manager.getRepository(ChatEntity).save(chat);
      }
    });
  }

  private async softDeleteVote(id: string): Promise<void> {
    await this.votes
      .createQueryBuilder()
      .update(MessageVoteEntity)
      .set({ deletedAt: new Date(), deletedBy: DEMO_USER_ID, updatedBy: DEMO_USER_ID })
      .where('id = :id AND deleted_at IS NULL', { id })
      .execute();
  }

  private async toChat(chat: ChatEntity) {
    return {
      id: chat.id,
      title: chat.title,
      visibility: chat.visibility,
      createdAt: chat.createdAt,
      messages: await this.getMessages(chat.id),
    };
  }
}
