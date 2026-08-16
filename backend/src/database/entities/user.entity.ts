import { Column, Entity, Index } from 'typeorm';
import { AuditedEntity } from './audited.entity';
import { DATABASE_SCHEMA, DATABASE_TABLE_PREFIX } from '../database.constants';

export const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

@Entity({ name: `${DATABASE_TABLE_PREFIX}users`, schema: DATABASE_SCHEMA })
@Index(['username'], { unique: true })
export class UserEntity extends AuditedEntity {
  @Column({ type: 'varchar', length: 100 })
  username!: string;

  @Column({ name: 'display_name', type: 'varchar', length: 160 })
  displayName!: string;

  @Column({ name: 'avatar_url', type: 'varchar', length: 500, nullable: true })
  avatarUrl!: string | null;
}
