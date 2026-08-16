import { Module } from '@nestjs/common';
import { AiConfig } from './ai.config';

@Module({
  providers: [AiConfig],
  exports: [AiConfig],
})
export class AiConfigModule {}
