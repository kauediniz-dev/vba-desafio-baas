import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WebhookEvent } from './entities/webhook-event.entity';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { Order } from '../orders/entities/order.entity';
import { Transaction } from '../transactions/entities/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WebhookEvent, Order, Transaction])],
  controllers: [WebhooksController],
  providers: [WebhooksService],
})
export class WebhooksModule {}
