import { BadRequestException, Injectable, Logger } from '@nestjs/common';
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
import { AgentMessagesService } from '../ai/agent-messages.service';
import { modelConfig } from '../ai/model.config';
import { ChatMessagesService } from './chat-messages.service';
import { ChatsService } from './chats.service';
import { ChatTitleService } from './chat-title.service';

@Injectable()
export class ChatStreamService {
  private readonly logger = new Logger(ChatStreamService.name);

  constructor(
    private readonly agentMessages: AgentMessagesService,
    private readonly chatsService: ChatsService,
    private readonly messagesService: ChatMessagesService,
    private readonly chatTitleService: ChatTitleService,
  ) {}

  async getContext(chatId: string): Promise<ChatContext> {
    const modelMessages = await convertToModelMessages(await this.messagesService.getMessages(chatId));

    return {
      contextWindow: modelConfig.contextWindow,
      estimatedTokens: Math.max(0, Math.round(JSON.stringify(modelMessages).length / 4)),
    };
  }

  async streamChat(chatId: string, message: UIMessage<ChatMessageMetadata>, response: Response): Promise<void> {
    if (message.role !== 'user') throw new BadRequestException('message must be from the user');

    const chat = await this.chatsService.ensureOwned(chatId);
    const titlePromise = this.chatTitleService.generate(chatId, chat.title, message);
    const abortController = new AbortController();
    response.once('close', () => {
      if (!response.writableEnded) abortController.abort();
    });
    const agentStream = await this.agentMessages.stream(chatId, chat.userId, message, abortController.signal);
    const mastraStream = toAISdkStream(agentStream, {
      from: 'agent',
      version: 'v7',
      sendReasoning: false,
      messageMetadata: ({ part }) => {
        if (part.type !== 'finish') return undefined;

        return {
          contextWindow: modelConfig.contextWindow,
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
      originalMessages: [message],
      generateId: randomUUID,
      execute: ({ writer }) => writer.merge(mastraStream),
      onError: (error) => this.handleError(error),
      onEnd: async ({ responseMessage, isAborted }) => {
        if (!isAborted && responseMessage.parts.length) {
          await this.chatsService.touch(chatId);
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
