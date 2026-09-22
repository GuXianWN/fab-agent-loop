import { Injectable, Logger } from '@nestjs/common';
import { toAISdkStream } from '@mastra/ai-sdk';
import {
  convertToModelMessages,
  createUIMessageStream,
  pipeUIMessageStreamToResponse,
  type UIMessage,
} from 'ai';
import { randomUUID } from 'node:crypto';
import type { Response } from 'express';
import type { ChatContext, ChatMessageMetadata } from '@recovery-assistant/shared';
import { AiConfig } from './ai.config';
import { ChatsService } from '../chats/chats.service';
import { ChatTitleService } from './chat-title.service';
import { RecoveryAgent } from './recovery.agent';

@Injectable()
export class ChatStreamService {
  private readonly logger = new Logger(ChatStreamService.name);

  constructor(
    private readonly config: AiConfig,
    private readonly agent: RecoveryAgent,
    private readonly chatsService: ChatsService,
    private readonly chatTitleService: ChatTitleService,
  ) {}

  async getContext(chatId: string): Promise<ChatContext> {
    const modelMessages = convertToModelMessages(await this.chatsService.getMessages(chatId));

    return {
      contextWindow: this.config.contextWindow,
      estimatedTokens: Math.max(0, Math.round(JSON.stringify(modelMessages).length / 4)),
    };
  }

  async streamChat(chatId: string, messages: UIMessage<ChatMessageMetadata>[], response: Response): Promise<void> {
    // 只持久化本次新增的最后一条用户消息。
    await this.chatsService.saveLatestUserMessage(chatId, messages);
    // 模型上下文始终从数据库历史恢复，不直接信任客户端传来的完整消息列表。
    const history = await this.chatsService.getMessages(chatId);
    const titlePromise = this.chatTitleService.generate(chatId, history);
    const agentStream = await this.agent.stream(history);
    const mastraStream = toAISdkStream(agentStream, {
      from: 'agent',
      version: 'v7',
      sendReasoning: true,
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
      onError: (error) => this.handleError(error),
    });
    const stream = createUIMessageStream<UIMessage>({
      originalMessages: messages,
      generateId: randomUUID,
      execute: ({ writer }) => writer.merge(mastraStream),
      onError: (error) => this.handleError(error),
      onEnd: async ({ responseMessage, isAborted }) => {
        // 仅在流正常完成时持久化完整的助手消息。
        if (!isAborted && responseMessage.parts.length) {
          await this.chatsService.saveAssistantMessage(chatId, responseMessage);
          await this.chatTitleService.save(chatId, await titlePromise);
        }
      },
    });

    await pipeUIMessageStreamToResponse({ response, stream });
  }

  private handleError(error: unknown): string {
    this.logger.error(error);
    return 'An error occurred.';
  }
}
