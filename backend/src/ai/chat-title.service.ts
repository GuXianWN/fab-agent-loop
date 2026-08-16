import { Injectable, Logger } from '@nestjs/common';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { generateText, type ModelMessage } from 'ai';
import { AiConfig, CHAT_TITLE_PROMPT } from './ai.config';
import { ChatsService } from '../chats/chats.service';

@Injectable()
export class ChatTitleService {
  private readonly logger = new Logger(ChatTitleService.name);

  constructor(
    private readonly config: AiConfig,
    private readonly chatsService: ChatsService,
  ) {}

  async generate(chatId: string, messages: ModelMessage[]): Promise<string | null> {
    if (await this.chatsService.getTitle(chatId)) return null;

    const firstUserMessage = messages.find((message) => message.role === 'user');
    if (!firstUserMessage) return null;

    try {
      const deepSeek = createDeepSeek({
        apiKey: this.config.apiKey,
        baseURL: this.config.baseURL,
      });
      const result = await generateText({
        model: deepSeek(this.config.model),
        system: CHAT_TITLE_PROMPT,
        prompt: JSON.stringify(firstUserMessage),
        maxOutputTokens: 80,
        providerOptions: {
          deepseek: {
            thinking: { type: 'disabled' },
          },
        },
      });

      return result.text.trim().slice(0, 30) || null;
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  async save(chatId: string, title: string | null): Promise<void> {
    if (title) await this.chatsService.saveGeneratedTitle(chatId, title);
  }
}
