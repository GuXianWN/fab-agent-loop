import { Injectable, Logger } from '@nestjs/common';
import { createDeepSeek, type DeepSeekLanguageModelChatOptions } from '@ai-sdk/deepseek';
import {
  convertToModelMessages,
  pipeUIMessageStreamToResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from 'ai';
import { randomUUID } from 'node:crypto';
import type { Response } from 'express';
import { AiConfig } from './ai.config';
import { ChatsService } from '../chats/chats.service';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly config: AiConfig,
    private readonly chatsService: ChatsService,
  ) {}

  async streamChat(chatId: string, messages: UIMessage[], response: Response): Promise<void> {
    await this.chatsService.saveLatestUserMessage(chatId, messages);
    const persistedMessages = await this.chatsService.getMessages(chatId);
    const deepSeek = createDeepSeek({
      apiKey: this.config.apiKey,
      baseURL: this.config.baseURL,
    });

    const result = streamText({
      model: deepSeek(this.config.model),
      messages: await convertToModelMessages(persistedMessages),
      providerOptions: {
        deepseek: {
          thinking: { type: 'enabled' },
          reasoningEffort: 'high',
        } satisfies DeepSeekLanguageModelChatOptions,
      },
      onError: ({ error }) => this.logger.error(error),
      onChunk: ({ chunk }) => {
        this.logger.debug(`AI stream chunk chatId=${chatId} ${JSON.stringify(chunk)}`);
      },
      onEnd: ({ finalStep, finishReason, usage }) => {
        this.logger.log(
          `AI stream completed chatId=${chatId} model=${this.config.model} finishReason=${finishReason} reasoningCharacters=${finalStep.reasoningText?.length ?? 0} reasoningTokens=${usage.outputTokenDetails.reasoningTokens ?? 0} textCharacters=${finalStep.text.length}`,
        );
      },
    });

    await pipeUIMessageStreamToResponse({
      response,
      stream: toUIMessageStream({
        stream: result.stream,
        originalMessages: messages,
        generateMessageId: randomUUID,
        onError: (error) => {
          this.logger.error(error);
          return 'An error occurred.';
        },
        onEnd: async ({ responseMessage, isAborted }) => {
          const reasoningParts = responseMessage.parts.filter((part) => part.type === 'reasoning');
          this.logger.log(
            `AI UI message completed chatId=${chatId} aborted=${isAborted} parts=${responseMessage.parts.map((part) => part.type).join(',')} reasoningParts=${reasoningParts.length} reasoningCharacters=${reasoningParts.reduce((total, part) => total + part.text.length, 0)}`,
          );

          if (!isAborted && responseMessage.parts.length) {
            await this.chatsService.saveAssistantMessage(chatId, responseMessage);
          }
        },
      }),
    });
  }
}
