import 'dotenv/config';
import { DataSource } from 'typeorm';
import { DatabaseConfig } from './database.config';
import { databaseEntities } from './entities';

const config = new DatabaseConfig();

export default new DataSource({
  ...config.dataSourceOptions,
  entities: databaseEntities,
  migrations: [`${__dirname}/migrations/*.js`],
});
