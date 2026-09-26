import { Injectable, NotFoundException } from '@nestjs/common';
import type { ChatVote } from '@recovery-assistant/shared';
import type { UIMessage } from 'ai';
import { ChatMemoryService } from '../database/chat-memory.service';
import { ChatsService } from './chats.service';

@Injectable()
export class ChatMessagesService {
  constructor(
    private readonly chats: ChatsService,
    private readonly memory: ChatMemoryService,
  ) {}

  async getMessages(chatId: string): Promise<UIMessage[]> {
    await this.chats.ensureOwned(chatId);
    return this.memory.getMessages(chatId);
  }

  async removeMessage(chatId: string, messageId: string): Promise<void> {
    const messages = await this.getMessages(chatId);
    const index = messages.findIndex(({ id }) => id === messageId);
    if (index === -1) throw new NotFoundException('message not found');

    await this.memory.deleteMessages(messages.slice(index).map(({ id }) => id));
  }

  async listVotes(chatId: string): Promise<ChatVote[]> {
    const messages = await this.getMessages(chatId);
    return messages.flatMap(({ id, metadata }) => {
      const isUpvoted = (metadata as { isUpvoted?: boolean | null } | undefined)?.isUpvoted;
      return typeof isUpvoted === 'boolean' ? [{ chatId, messageId: id, isUpvoted }] : [];
    });
  }

  async setVote(chatId: string, messageId: string, isUpvoted?: boolean): Promise<void> {
    if (!(await this.getMessages(chatId)).some(({ id }) => id === messageId)) {
      throw new NotFoundException('message not found');
    }
    await this.memory.setVote(messageId, isUpvoted);
  }
}
