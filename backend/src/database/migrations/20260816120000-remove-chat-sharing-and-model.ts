import type { MigrationInterface, QueryRunner } from 'typeorm';
import { DATABASE_SCHEMA, DATABASE_TABLE_PREFIX } from '../database.constants';

export class RemoveChatSharingAndModel20260816120000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE ${DATABASE_SCHEMA}.${DATABASE_TABLE_PREFIX}chats DROP COLUMN visibility`);
    await queryRunner.query(`ALTER TABLE ${DATABASE_SCHEMA}.${DATABASE_TABLE_PREFIX}chats DROP COLUMN model`);
    await queryRunner.query(`ALTER TABLE ${DATABASE_SCHEMA}.${DATABASE_TABLE_PREFIX}chats DROP COLUMN share_id`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE ${DATABASE_SCHEMA}.${DATABASE_TABLE_PREFIX}chats ADD COLUMN visibility varchar(20) NOT NULL DEFAULT 'private'`);
    await queryRunner.query(`ALTER TABLE ${DATABASE_SCHEMA}.${DATABASE_TABLE_PREFIX}chats ADD COLUMN model varchar(100) NOT NULL DEFAULT ''`);
    await queryRunner.query(`ALTER TABLE ${DATABASE_SCHEMA}.${DATABASE_TABLE_PREFIX}chats ADD COLUMN share_id uuid`);
    await queryRunner.query(`CREATE UNIQUE INDEX idx_ra_chats_share_id ON ${DATABASE_SCHEMA}.${DATABASE_TABLE_PREFIX}chats (share_id)`);
  }
}
