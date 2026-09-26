import { Injectable } from '@nestjs/common';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { databaseEntities } from './entities';

@Injectable()
export class DatabaseConfig {
  readonly host = process.env.POSTGRES_HOST!;
  readonly port = Number(process.env.POSTGRES_PORT!);
  readonly user = process.env.POSTGRES_USER!;
  readonly password = process.env.POSTGRES_PASSWORD!;
  readonly database = process.env.POSTGRES_DATABASE!;

  readonly options: TypeOrmModuleOptions = {
    type: 'postgres',
    host: this.host,
    port: this.port,
    username: this.user,
    password: this.password,
    database: this.database,
    entities: databaseEntities,
    logging: ['query', 'error'],
    synchronize: true,
    retryAttempts: 1,
  };
}
