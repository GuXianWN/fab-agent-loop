import { Check, Column, Entity, Index } from 'typeorm';
import { AuditedEntity } from './audited.entity';
import { DATABASE_SCHEMA, DATABASE_TABLE_PREFIX } from '../database.constants';

@Entity({ name: `${DATABASE_TABLE_PREFIX}message_votes`, schema: DATABASE_SCHEMA })
@Check('"value" IN (-1, 1)')
@Index(['userId', 'messageId'], { unique: true })
@Index(['messageId'])
export class MessageVoteEntity extends AuditedEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'message_id', type: 'uuid' })
  messageId!: string;

  @Column({ type: 'smallint' })
  value!: -1 | 1;
}
