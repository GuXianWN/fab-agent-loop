import { Injectable, Logger } from '@nestjs/common';
import type { UIMessage } from 'ai';
import { AgentMessagesService } from '../ai/agent-messages.service';
import { ChatMessagesService } from './chat-messages.service';
import { ChatsService } from './chats.service';

@Injectable()
export class ChatTitleService {
  private readonly logger = new Logger(ChatTitleService.name);

  constructor(
    private readonly agentMessages: AgentMessagesService,
    private readonly chatsService: ChatsService,
    private readonly messagesService: ChatMessagesService,
  ) {}

  async generate(chatId: string, currentTitle: string | null, message: UIMessage): Promise<string | null> {
    if (currentTitle) return null;

    try {
      const messages = await this.messagesService.getMessages(chatId);
      const firstUserMessage = messages.find((item) => item.role === 'user') ?? message;
      return await this.agentMessages.generateTitle(firstUserMessage);
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  async save(chatId: string, title: string | null): Promise<void> {
    if (title) await this.chatsService.saveGeneratedTitle(chatId, title);
  }
}
