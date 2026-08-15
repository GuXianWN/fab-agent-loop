import { Module } from '@nestjs/common';
import { AiModule } from './ai/ai.module';
import { ChatsModule } from './chats/chats.module';
import { DatabaseModule } from './database/database.module';
import { SessionModule } from './session/session.module';

@Module({
  imports: [DatabaseModule, AiModule, ChatsModule, SessionModule],
})
export class AppModule {}
