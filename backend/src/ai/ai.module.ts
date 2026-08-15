import { Module } from '@nestjs/common';
import { ChatsModule } from '../chats/chats.module';
import { AiConfig } from './ai.config';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
  imports: [ChatsModule],
  controllers: [AiController],
  providers: [AiConfig, AiService],
})
export class AiModule {}
