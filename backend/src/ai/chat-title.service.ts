import { Injectable, Logger } from '@nestjs/common';
import type { UIMessage } from 'ai';
import { ChatsService } from '../chats/chats.service';
import { RecoveryAgent } from './recovery.agent';

@Injectable()
export class ChatTitleService {
  private readonly logger = new Logger(ChatTitleService.name);

  constructor(
    private readonly agent: RecoveryAgent,
    private readonly chatsService: ChatsService,
  ) {}

  async generate(chatId: string, messages: UIMessage[]): Promise<string | null> {
    if (await this.chatsService.getTitle(chatId)) return null;

    const firstUserMessage = messages.find((message) => message.role === 'user');
    if (!firstUserMessage) return null;

    try {
      return await this.agent.generateTitle(firstUserMessage);
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  async save(chatId: string, title: string | null): Promise<void> {
    if (title) await this.chatsService.saveGeneratedTitle(chatId, title);
  }
}
