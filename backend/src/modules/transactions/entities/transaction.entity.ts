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

import { Order } from '../../orders/entities/order.entity';
import { TransactionStatus } from '../enum/transaction-status.enum';
import { TransactionType } from '../enum/transaction-type.enum';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 36 })
  orderId!: string;

  @ManyToOne(() => Order, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'orderId',
    referencedColumnName: 'id',
  })
  order!: Order;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  gatewayTransactionId!: string | null;

  @Index()
  @Column({
    type: 'varchar',
    length: 100,
  })
  externalReference!: string;

  @Column({
    type: 'int',
    unsigned: true,
  })
  amountInCents!: number;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type!: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status!: TransactionStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
