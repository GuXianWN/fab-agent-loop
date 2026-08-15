import type { MigrationInterface, QueryRunner } from 'typeorm';
import { DATABASE_SCHEMA, DATABASE_TABLE_PREFIX } from '../database.constants';
import { DEMO_USER_ID } from '../entities/user.entity';

export class CreateCoreChatSchema20260815180000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS ${DATABASE_SCHEMA}`);

    await queryRunner.query(`
      CREATE TABLE ${DATABASE_SCHEMA}.${DATABASE_TABLE_PREFIX}users (
        id uuid PRIMARY KEY,
        username varchar(100) NOT NULL UNIQUE,
        display_name varchar(160) NOT NULL,
        avatar_url varchar(500),
        created_at timestamptz NOT NULL DEFAULT now(),
        created_by uuid NOT NULL,
        updated_at timestamptz NOT NULL DEFAULT now(),
        updated_by uuid NOT NULL,
        deleted_at timestamptz,
        deleted_by uuid
      )
    `);

    await queryRunner.query(`
      CREATE TABLE ${DATABASE_SCHEMA}.${DATABASE_TABLE_PREFIX}chats (
        id uuid PRIMARY KEY,
        user_id uuid NOT NULL,
        title varchar(256),
        visibility varchar(20) NOT NULL DEFAULT 'private',
        model varchar(100) NOT NULL,
        share_id uuid NOT NULL UNIQUE,
        created_at timestamptz NOT NULL DEFAULT now(),
        created_by uuid NOT NULL,
        updated_at timestamptz NOT NULL DEFAULT now(),
        updated_by uuid NOT NULL,
        deleted_at timestamptz,
        deleted_by uuid
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_ra_chats_user_updated_at ON ${DATABASE_SCHEMA}.${DATABASE_TABLE_PREFIX}chats (user_id, updated_at DESC)`);

    await queryRunner.query(`
      CREATE TABLE ${DATABASE_SCHEMA}.${DATABASE_TABLE_PREFIX}messages (
        id uuid PRIMARY KEY,
        chat_id uuid NOT NULL,
        role varchar(20) NOT NULL,
        parts jsonb NOT NULL,
        metadata jsonb,
        sequence integer NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        created_by uuid NOT NULL,
        updated_at timestamptz NOT NULL DEFAULT now(),
        updated_by uuid NOT NULL,
        deleted_at timestamptz,
        deleted_by uuid,
        CONSTRAINT uq_messages_chat_sequence UNIQUE (chat_id, sequence)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE ${DATABASE_SCHEMA}.${DATABASE_TABLE_PREFIX}message_votes (
        id uuid PRIMARY KEY,
        user_id uuid NOT NULL,
        message_id uuid NOT NULL,
        value smallint NOT NULL CHECK (value IN (-1, 1)),
        created_at timestamptz NOT NULL DEFAULT now(),
        created_by uuid NOT NULL,
        updated_at timestamptz NOT NULL DEFAULT now(),
        updated_by uuid NOT NULL,
        deleted_at timestamptz,
        deleted_by uuid,
        CONSTRAINT uq_message_votes_user_message UNIQUE (user_id, message_id)
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_ra_message_votes_message_id ON ${DATABASE_SCHEMA}.${DATABASE_TABLE_PREFIX}message_votes (message_id)`);

    await queryRunner.query(
      `INSERT INTO ${DATABASE_SCHEMA}.${DATABASE_TABLE_PREFIX}users (id, username, display_name, avatar_url, created_by, updated_by)
       VALUES ($1, 'demo_user', 'Demo User', 'https://github.com/nuxt.png', $1, $1)`,
      [DEMO_USER_ID],
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP SCHEMA ${DATABASE_SCHEMA} CASCADE`);
  }
}
