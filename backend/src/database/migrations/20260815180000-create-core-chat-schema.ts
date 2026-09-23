import type { MigrationInterface, QueryRunner } from 'typeorm';
import { DATABASE_SCHEMA, DATABASE_TABLE_PREFIX } from '../database.constants';

export class CreateCoreChatSchema20260815180000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS ${DATABASE_SCHEMA}`);
    await queryRunner.query(`
      CREATE TABLE ${DATABASE_SCHEMA}.${DATABASE_TABLE_PREFIX}chats (
        id uuid PRIMARY KEY,
        user_id varchar(100) NOT NULL,
        title varchar(256),
        created_at timestamptz NOT NULL DEFAULT now(),
        created_by varchar(100) NOT NULL,
        updated_at timestamptz NOT NULL DEFAULT now(),
        updated_by varchar(100) NOT NULL,
        deleted_at timestamptz,
        deleted_by varchar(100)
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_ra_chats_user_updated_at ON ${DATABASE_SCHEMA}.${DATABASE_TABLE_PREFIX}chats (user_id, updated_at DESC)`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP SCHEMA ${DATABASE_SCHEMA} CASCADE`);
  }
}
