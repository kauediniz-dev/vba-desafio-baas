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
import { CheckoutStatus } from '../enums/checkout-status.enum';
import { PaymentMethod } from '../enums/payment-method.enum';

@Entity('checkout_links')
export class CheckoutLink {
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

  @Column({ type: 'int', unsigned: true })
  amountInCents!: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod!: PaymentMethod;

  @Column({
    type: 'enum',
    enum: CheckoutStatus,
    default: CheckoutStatus.PENDING,
  })
  status!: CheckoutStatus;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  feePercent!: string | null;

  @Column({
    type: 'tinyint',
    unsigned: true,
    nullable: true,
  })
  installments!: number | null;

  @Column({
    type: 'datetime',
    nullable: true,
  })
  expiresAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
