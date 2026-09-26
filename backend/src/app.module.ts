import { Module } from '@nestjs/common';
import { ChatsModule } from './chats/chats.module';
import { DatabaseModule } from './database/database.module';
import { SessionModule } from './session/session.module';

@Module({
  imports: [DatabaseModule, ChatsModule, SessionModule],
})
export class AppModule {}
