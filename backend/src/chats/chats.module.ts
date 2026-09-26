import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiModule } from '../ai/ai.module';
import { DatabaseModule } from '../database/database.module';
import { ChatEntity } from '../database/entities';
import { ChatMessagesService } from './chat-messages.service';
import { ChatStreamController } from './chat-stream.controller';
import { ChatStreamService } from './chat-stream.service';
import { ChatTitleService } from './chat-title.service';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';

@Module({
  imports: [AiModule, DatabaseModule, TypeOrmModule.forFeature([ChatEntity])],
  controllers: [ChatsController, ChatStreamController],
  providers: [ChatsService, ChatMessagesService, ChatStreamService, ChatTitleService],
})
export class ChatsModule {}
