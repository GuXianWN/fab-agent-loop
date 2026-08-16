import { BadRequestException, Body, Controller, Get, Param, ParseUUIDPipe, Post, Res } from '@nestjs/common';
import { safeValidateUIMessages } from 'ai';
import type { Response } from 'express';
import type { ChatMessageMetadata } from '@recovery-assistant/shared';
import type { UIMessage } from 'ai';
import { R } from '../common/r';
import { ChatStreamService } from './chat-stream.service';
import { ChatStreamRequestDto } from './dto/chat-stream-request.dto';

@Controller('ai')
export class ChatStreamController {
  constructor(private readonly chatStreamService: ChatStreamService) {}

  @Get('chats/:id/context')
  async context(@Param('id', ParseUUIDPipe) id: string) {
    return R.success().data(await this.chatStreamService.getContext(id));
  }

  @Post('chat')
  async chat(@Body() body: ChatStreamRequestDto, @Res() response: Response): Promise<void> {
    const validation = await safeValidateUIMessages<UIMessage<ChatMessageMetadata>>({ messages: body.messages });

    if (!validation.success) {
      throw new BadRequestException('messages must be valid AI SDK UI messages');
    }

    await this.chatStreamService.streamChat(body.chatId, validation.data, response);
  }
}
