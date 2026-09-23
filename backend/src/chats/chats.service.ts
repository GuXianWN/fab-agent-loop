import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { UIMessage } from 'ai';
import { randomUUID } from 'node:crypto';
import { Repository } from 'typeorm';
import type { Chat, ChatVote, UpdateChatInput } from '@recovery-assistant/shared';
import { getUser } from '../common/user-context';
import { ChatMemoryService } from '../database/chat-memory.service';
import { ChatEntity } from '../database/entities';

type ChatResult = Omit<Chat<UIMessage>, 'createdAt'> & { createdAt: Date };

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(ChatEntity) private readonly chats: Repository<ChatEntity>,
    private readonly memory: ChatMemoryService,
  ) {}

  //region Chats
  list(): Promise<ChatEntity[]> {
    return this.chats.find({
      where: { userId: getUser().id },
      order: { updatedAt: 'DESC' },
    });
  }

  async create(input?: string): Promise<ChatResult> {
    const userId = getUser().id;
    const chat = this.chats.create({
      id: randomUUID(),
      userId,
      title: null,
      createdBy: userId,
      updatedBy: userId,
    });

    await this.chats.save(chat);
    await this.memory.createThread(chat.id);

    if (input) {
      await this.memory.saveMessage(chat.id, {
        id: randomUUID(),
        role: 'user',
        parts: [{ type: 'text', text: input }],
      });
    }

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
    const chat = await this.requireChat(id);
    await this.memory.deleteThread(id);

    chat.deletedAt = new Date();
    chat.deletedBy = getUser().id;
    chat.updatedBy = getUser().id;
    await this.chats.save(chat);
  }
  //endregion

  //region Votes
  async listVotes(chatId: string): Promise<ChatVote[]> {
    const messages = await this.getMessages(chatId);
    return messages.flatMap(({ id, metadata }) => {
      const isUpvoted = (metadata as { isUpvoted?: boolean | null } | undefined)?.isUpvoted;
      return typeof isUpvoted === 'boolean' ? [{ chatId, messageId: id, isUpvoted }] : [];
    });
  }

  async setVote(chatId: string, messageId: string, isUpvoted?: boolean): Promise<void> {
    await this.requireMessage(chatId, messageId);
    await this.memory.setVote(messageId, isUpvoted);
  }
  //endregion

  //region Messages
  async removeMessage(chatId: string, messageId: string): Promise<void> {
    const messages = await this.getMessages(chatId);
    const index = messages.findIndex(({ id }) => id === messageId);
    if (index === -1) throw new NotFoundException('message not found');

    const ids = messages.slice(index).map(({ id }) => id);
    await this.memory.deleteMessages(ids);
  }

  async saveLatestUserMessage(chatId: string, messages: UIMessage[]): Promise<void> {
    const message = messages.at(-1);
    if (!message || message.role !== 'user') return;

    const stored = await this.getMessages(chatId);
    if (!stored.some(({ id }) => id === message.id)) {
      await this.memory.saveMessage(chatId, { ...message, metadata: undefined });
    }
  }

  async saveAssistantMessage(chatId: string, message: UIMessage): Promise<void> {
    await this.requireChat(chatId);
    await this.memory.saveMessage(chatId, message);
    await this.chats.update(chatId, { updatedAt: new Date(), updatedBy: getUser().id });
  }

  async getMessages(chatId: string): Promise<UIMessage[]> {
    await this.requireChat(chatId);
    return this.memory.getMessages(chatId);
  }
  //endregion

  private async requireChat(id: string): Promise<ChatEntity> {
    const chat = await this.chats.findOne({ where: { id, userId: getUser().id } });
    if (!chat) throw new NotFoundException('chat not found');
    return chat;
  }

  private async requireMessage(chatId: string, id: string): Promise<void> {
    if (!(await this.getMessages(chatId)).some((message) => message.id === id)) {
      throw new NotFoundException('message not found');
    }
  }

  private async toChat(chat: ChatEntity): Promise<ChatResult> {
    return {
      id: chat.id,
      title: chat.title,
      createdAt: chat.createdAt,
      messages: await this.memory.getMessages(chat.id),
    };
  }
}
