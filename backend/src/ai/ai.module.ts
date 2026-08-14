import { Module } from '@nestjs/common';
import { AiConfig } from './ai.config';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
  controllers: [AiController],
  providers: [AiConfig, AiService],
})
export class AiModule {}
