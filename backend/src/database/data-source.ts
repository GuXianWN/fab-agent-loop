import 'dotenv/config';
import { DataSource } from 'typeorm';
import { DatabaseConfig } from './database.config';

const config = new DatabaseConfig();

export default new DataSource({
  ...config.dataSourceOptions,
  migrations: [`${__dirname}/migrations/*.js`],
});
