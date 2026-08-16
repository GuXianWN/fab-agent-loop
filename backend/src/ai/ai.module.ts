import { Module } from '@nestjs/common';
import { ChatsModule } from '../chats/chats.module';
import { AiConfigModule } from './ai-config.module';
import { ChatStreamController } from './chat-stream.controller';
import { ChatStreamService } from './chat-stream.service';
import { ChatTitleService } from './chat-title.service';

@Module({
  imports: [AiConfigModule, ChatsModule],
  controllers: [ChatStreamController],
  providers: [ChatStreamService, ChatTitleService],
})
export class AiModule {}
