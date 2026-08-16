import { IsArray, IsUUID } from 'class-validator';
import type { UIMessage } from 'ai';
import type { ChatMessageMetadata } from '@recovery-assistant/shared';

export class ChatStreamRequestDto {
  @IsUUID()
  chatId!: string;

  @IsArray()
  messages!: UIMessage<ChatMessageMetadata>[];
}
