import { Injectable, Logger } from '@nestjs/common';
import { createDeepSeek } from '@ai-sdk/deepseek';
import {
  convertToModelMessages,
  pipeUIMessageStreamToResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from 'ai';
import { randomUUID } from 'node:crypto';
import type { Response } from 'express';
import type { ChatMessageMetadata } from '@recovery-assistant/shared';
import { AiConfig } from './ai.config';
import { ChatsService } from '../chats/chats.service';

@Injectable()
export class ChatStreamService {
  private readonly logger = new Logger(ChatStreamService.name);

  constructor(
    private readonly config: AiConfig,
    private readonly chatsService: ChatsService,
  ) {}

  async streamChat(chatId: string, messages: UIMessage<ChatMessageMetadata>[], response: Response): Promise<void> {
    // 只持久化本次新增的最后一条用户消息。
    await this.chatsService.saveLatestUserMessage(chatId, messages);
    // 模型上下文始终从数据库历史恢复，不直接信任客户端传来的完整消息列表。
    const persistedMessages = await this.chatsService.getMessages(chatId);
    const deepSeek = createDeepSeek({
      apiKey: this.config.apiKey,
      baseURL: this.config.baseURL,
    });

    const result = streamText({
      model: deepSeek(this.config.model),
      // UIMessage 用于前端和 SSE，调用模型前转换为 ModelMessage。
      messages: await convertToModelMessages(persistedMessages),
      providerOptions: {
        deepseek: {
          thinking: { type: 'enabled' },
          reasoningEffort: 'high',
        }
      }
    });

    await pipeUIMessageStreamToResponse({
      response,
      stream: toUIMessageStream({
        stream: result.stream,
        originalMessages: messages,
        generateMessageId: randomUUID,
        messageMetadata: ({ part }) => {
          if (part.type !== 'finish') return undefined;

          return {
            contextWindow: this.config.contextWindow,
            usage: {
              inputTokens: part.totalUsage.inputTokens ?? 0,
              outputTokens: part.totalUsage.outputTokens ?? 0,
              reasoningTokens: part.totalUsage.outputTokenDetails.reasoningTokens ?? 0,
              totalTokens: part.totalUsage.totalTokens ?? 0,
            },
          } satisfies ChatMessageMetadata;
        },
        onError: (error) => {
          this.logger.error(error);
          return 'An error occurred.';
        },
        onEnd: async ({ responseMessage, isAborted }) => {
          // 仅在流正常完成时持久化完整的助手消息。
          if (!isAborted && responseMessage.parts.length) {
            await this.chatsService.saveAssistantMessage(chatId, responseMessage);
          }
        },
      }),
    });
  }
}
