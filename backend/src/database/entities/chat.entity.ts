import { Column, Entity, Index } from 'typeorm';
import { AuditedEntity } from './audited.entity';
import { DATABASE_SCHEMA, DATABASE_TABLE_PREFIX } from '../database.constants';

@Entity({ name: `${DATABASE_TABLE_PREFIX}chats`, schema: DATABASE_SCHEMA })
@Index('idx_ra_chats_user_updated_at', ['userId', 'updatedAt'])
export class ChatEntity extends AuditedEntity {
  @Column({ name: 'user_id', type: 'varchar', length: 100 })
  userId!: string;

  @Column({ type: 'varchar', length: 256, nullable: true })
  title!: string | null;
}
