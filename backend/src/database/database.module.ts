import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfig } from './database.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      extraProviders: [DatabaseConfig],
      inject: [DatabaseConfig],
      useFactory: (config: DatabaseConfig) => config.options,
    }),
  ],
})
export class DatabaseModule {}
