import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { createOpenAI } from '@ai-sdk/openai';
import { convertToModelMessages, streamText, type UIMessage } from 'ai';
import type { Response } from 'express';

@Injectable()
export class AiService {
  async streamChat(messages: UIMessage[], response: Response): Promise<void> {
    const apiKey = process.env.OPENAI_API_KEY ?? process.env.AI_API_KEY;

    if (!apiKey) {
      throw new ServiceUnavailableException('OPENAI_API_KEY is not configured');
    }

    const openai = createOpenAI({
      apiKey,
      baseURL: process.env.OPENAI_BASE_URL,
    });

    const result = streamText({
      model: openai(process.env.OPENAI_MODEL ?? 'gpt-4.1-mini'),
      messages: await convertToModelMessages(messages),
    });

    await result.pipeUIMessageStreamToResponse(response);
  }
}
