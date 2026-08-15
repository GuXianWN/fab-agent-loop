import { BadRequestException, Body, Controller, Post, Res } from '@nestjs/common';
import { safeValidateUIMessages } from 'ai';
import type { Response } from 'express';
import { AiService } from './ai.service';

interface ChatRequest {
  chatId?: unknown;
  messages?: unknown;
}

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chat(@Body() body: ChatRequest, @Res() response: Response): Promise<void> {
    if (typeof body.chatId !== 'string') {
      throw new BadRequestException('chatId must be a string');
    }

    const validation = await safeValidateUIMessages({ messages: body.messages });

    if (!validation.success) {
      throw new BadRequestException('messages must be valid AI SDK UI messages');
    }

    await this.aiService.streamChat(body.chatId, validation.data, response);
  }
}
