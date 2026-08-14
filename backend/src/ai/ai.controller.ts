import { BadRequestException, Body, Controller, Post, Res } from '@nestjs/common';
import { safeValidateUIMessages } from 'ai';
import type { Response } from 'express';
import { AiService } from './ai.service';

interface ChatRequest {
  messages?: unknown;
}

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chat(@Body() body: ChatRequest, @Res() response: Response): Promise<void> {
    const validation = await safeValidateUIMessages({ messages: body.messages });

    if (!validation.success) {
      throw new BadRequestException('messages must be valid AI SDK UI messages');
    }

    await this.aiService.streamChat(validation.data, response);
  }
}
