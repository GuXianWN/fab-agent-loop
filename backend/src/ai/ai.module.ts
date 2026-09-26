import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AgentMessagesService } from './agent-messages.service';
import { RecoveryAgent } from './recovery.agent';

@Module({
  imports: [DatabaseModule],
  providers: [RecoveryAgent, AgentMessagesService],
  exports: [AgentMessagesService],
})
export class AiModule {}
