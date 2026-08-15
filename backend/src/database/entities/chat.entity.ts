import { Column, Entity, Index } from 'typeorm';
import { AuditedEntity } from './audited.entity';
import { DATABASE_SCHEMA, DATABASE_TABLE_PREFIX } from '../database.constants';

export type ChatVisibility = 'private' | 'public';

@Entity({ name: `${DATABASE_TABLE_PREFIX}chats`, schema: DATABASE_SCHEMA })
@Index(['userId', 'updatedAt'])
@Index(['shareId'], { unique: true })
export class ChatEntity extends AuditedEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 256, nullable: true })
  title!: string | null;

  @Column({ type: 'varchar', length: 20, default: 'private' })
  visibility!: ChatVisibility;

  @Column({ type: 'varchar', length: 100 })
  model!: string;

  @Column({ name: 'share_id', type: 'uuid' })
  shareId!: string;
}
