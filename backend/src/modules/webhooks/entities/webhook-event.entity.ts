import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('webhook_events')
export class WebhookEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 150 })
  gatewayEventId!: string;

  @Column({ type: 'varchar', length: 100 })
  eventType!: string;

  @Index()
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  externalReference!: string | null;

  @Column({ type: 'json' })
  payload!: Record<string, unknown>;

  @Column({
    type: 'boolean',
    default: false,
  })
  processed!: boolean;

  @Column({
    type: 'datetime',
    nullable: true,
  })
  processedAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
