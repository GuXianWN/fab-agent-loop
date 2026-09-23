import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMemoryService } from './chat-memory.service';
import { DatabaseConfig } from './database.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      extraProviders: [DatabaseConfig],
      inject: [DatabaseConfig],
      useFactory: (config: DatabaseConfig) => config.options,
    }),
  ],
  providers: [DatabaseConfig, ChatMemoryService],
  exports: [ChatMemoryService],
})
export class DatabaseModule {}
