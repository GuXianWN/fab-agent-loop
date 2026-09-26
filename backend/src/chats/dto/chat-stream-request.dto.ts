import { IsObject, IsUUID } from 'class-validator';
import type { UIMessage } from 'ai';
import type { ChatMessageMetadata } from '@recovery-assistant/shared';

export class ChatStreamRequestDto {
  @IsUUID()
  chatId!: string;

  @IsObject()
  message!: UIMessage<ChatMessageMetadata>;
}
