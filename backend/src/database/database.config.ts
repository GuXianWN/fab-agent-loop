import { Injectable } from '@nestjs/common';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import type { DataSourceOptions } from 'typeorm';
import { databaseEntities } from './entities';

@Injectable()
export class DatabaseConfig {
  readonly dataSourceOptions: DataSourceOptions = {
    type: 'postgres',
    host: process.env.POSTGRES_HOST!,
    port: Number(process.env.POSTGRES_PORT!),
    username: process.env.POSTGRES_USER!,
    password: process.env.POSTGRES_PASSWORD!,
    database: process.env.POSTGRES_DATABASE!,
    entities: databaseEntities,
  };

  readonly options: TypeOrmModuleOptions = {
    ...this.dataSourceOptions,
    autoLoadEntities: true,
    logging: ['query', 'error'],
    synchronize: false,
    retryAttempts: 1,
  };
}
