import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { WithdrawalStatus } from '../enum/withdrawal-status.enum';

@Entity('withdrawals')
export class Withdrawal {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 36 })
  userId!: string;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'userId',
    referencedColumnName: 'id',
  })
  user!: User;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100 })
  externalReference!: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  gatewayWithdrawalId!: string | null;

  @Column({
    type: 'int',
    unsigned: true,
  })
  amountInCents!: number;

  @Column({
    type: 'enum',
    enum: WithdrawalStatus,
    default: WithdrawalStatus.PENDING,
  })
  status!: WithdrawalStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
