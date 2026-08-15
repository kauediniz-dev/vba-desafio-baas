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

import { CheckoutLink } from '../../checkout/entities/checkout-link.entity';
import { OrderStatus } from '../enums/order-status.enum';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 36 })
  checkoutLinkId!: string;

  @ManyToOne(() => CheckoutLink, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'checkoutLinkId',
    referencedColumnName: 'id',
  })
  checkoutLink!: CheckoutLink;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100 })
  externalReference!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  gatewayPaymentId!: string | null;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status!: OrderStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
