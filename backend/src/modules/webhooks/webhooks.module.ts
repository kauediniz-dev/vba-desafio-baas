import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Order } from '../orders/entities/order.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { Withdrawal } from '../withdrawals/entities/withdrawal.entity';

import { WebhookEvent } from './entities/webhook-event.entity';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([WebhookEvent, Order, Transaction, Withdrawal]),
  ],
  controllers: [WebhooksController],
  providers: [WebhooksService],
})
export class WebhooksModule {}
