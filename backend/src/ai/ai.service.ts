import { Injectable, Logger } from '@nestjs/common';
import { createOpenAI } from '@ai-sdk/openai';
import {
  convertToModelMessages,
  pipeUIMessageStreamToResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from 'ai';
import type { Response } from 'express';
import { AiConfig } from './ai.config';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly config: AiConfig) {}

  async streamChat(messages: UIMessage[], response: Response): Promise<void> {
    const openai = createOpenAI({
      apiKey: this.config.apiKey,
      baseURL: this.config.baseURL,
    });

    const result = streamText({
      model: openai(this.config.model),
      messages: await convertToModelMessages(messages),
      onError: ({ error }) => this.logger.error(error),
    });

    await pipeUIMessageStreamToResponse({
      response,
      stream: toUIMessageStream({ stream: result.stream }),
    });
  }
}
