import { Column, Entity, Index } from 'typeorm';
import type { UIMessage } from 'ai';
import { AuditedEntity } from './audited.entity';
import { DATABASE_SCHEMA, DATABASE_TABLE_PREFIX } from '../database.constants';

export type MessageRole = UIMessage['role'];

@Entity({ name: `${DATABASE_TABLE_PREFIX}messages`, schema: DATABASE_SCHEMA })
@Index(['chatId', 'sequence'], { unique: true })
export class MessageEntity extends AuditedEntity {
  @Column({ name: 'chat_id', type: 'uuid' })
  chatId!: string;

  @Column({ type: 'varchar', length: 20 })
  role!: MessageRole;

  @Column({ type: 'jsonb' })
  parts!: UIMessage['parts'];

  @Column({ type: 'jsonb', nullable: true })
  metadata!: UIMessage['metadata'] | null;

  @Column({ type: 'integer' })
  sequence!: number;
}
