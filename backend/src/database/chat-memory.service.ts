import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { convertMessages, type MessageListInput } from '@mastra/core/agent/message-list';
import { Memory } from '@mastra/memory';
import { PostgresStore } from '@mastra/pg';
import type { UIMessage } from 'ai';
import { getUser } from '../common/user-context';
import { DatabaseConfig } from './database.config';

@Injectable()
export class ChatMemoryService implements OnModuleInit, OnModuleDestroy {
  private readonly storage: PostgresStore;
  private readonly memory: Memory;

  constructor(config: DatabaseConfig) {
    this.storage = new PostgresStore({
      id: 'recovery-assistant-chat',
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      schemaName: 'recovery_assistant_mastra',
    });
    this.memory = new Memory({ storage: this.storage });
  }

  async onModuleInit(): Promise<void> {
    await this.storage.init();
  }

  async onModuleDestroy(): Promise<void> {
    await this.memory.settled();
    await this.storage.close();
  }

  async createThread(id: string): Promise<void> {
    const now = new Date();
    await this.memory.saveThread({
      thread: { id, resourceId: getUser().id, title: '', createdAt: now, updatedAt: now },
    });
  }

  async getMessages(threadId: string): Promise<UIMessage[]> {
    const { messages } = await this.memory.recall({
      threadId,
      resourceId: getUser().id,
      perPage: false,
    });

    // Mastra bundles its own AI SDK types; the UI-message wire format is shared.
    return convertMessages(messages).to('AIV6.UI') as unknown as UIMessage[];
  }

  async saveMessage(threadId: string, message: UIMessage): Promise<void> {
    const messages = convertMessages(message as unknown as MessageListInput)
      .to('Mastra.V2')
      .map((stored) => ({ ...stored, threadId, resourceId: getUser().id }));

    await this.memory.saveMessages({ messages });
  }

  async setVote(messageId: string, isUpvoted?: boolean): Promise<void> {
    const store = await this.storage.getStore('memory');
    if (!store) throw new Error('Mastra memory store is unavailable');

    const { messages } = await store.listMessagesById({ messageIds: [messageId] });
    const message = messages[0];
    if (!message) throw new Error('Mastra message is unavailable');

    await store.updateMessages({
      messages: [{
        id: messageId,
        content: {
          ...message.content,
          metadata: { ...message.content.metadata, isUpvoted: isUpvoted ?? null },
        },
      }],
    });
  }

  async deleteMessages(ids: string[]): Promise<void> {
    if (ids.length) await this.memory.deleteMessages(ids);
  }

  async deleteThread(id: string): Promise<void> {
    await this.memory.deleteThread(id);
  }
}
