import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { createHash } from 'node:crypto';
import { WebhookEvent } from './entities/webhook-event.entity';
import { Order } from '../orders/entities/order.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { OrderStatus } from '../orders/enums/order-status.enum';
import { TransactionStatus } from '../transactions/enum/transaction-status.enum';

@Injectable()
export class WebhooksService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(WebhookEvent)
    private readonly webhookEventRepository: Repository<WebhookEvent>,

    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async handleEvent(eventType: string, payload: unknown): Promise<void> {
    const normalizedPayload = this.normalizePayload(payload);

    const gatewayEventId = createHash('sha256')
      .update(
        JSON.stringify({
          eventType,
          payload: normalizedPayload,
        }),
      )
      .digest('hex');

    const externalReference = this.getStringField(payload, 'externalReference');
    const existingEvent = await this.webhookEventRepository.findOne({
      where: { gatewayEventId },
    });

    if (existingEvent) {
      return;
    }

    const webhookEvent = this.webhookEventRepository.create({
      gatewayEventId,
      eventType,
      externalReference,
      payload: normalizedPayload,
      processed: false,
      processedAt: null,
    });

    await this.webhookEventRepository.save(webhookEvent);

    const status = this.getStringField(payload, 'status');

    if (!externalReference || !status) {
      return;
    }

    const orderStatus = this.mapOrderStatus(status);

    const transactionStatus = this.mapTransactionStatus(status);

    if (!orderStatus || !transactionStatus) {
      return;
    }

    await this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(Order, {
        where: {
          externalReference,
        },
      });

      if (!order) {
        return;
      }

      const transaction = await manager.findOne(Transaction, {
        where: {
          orderId: order.id,
        },
      });

      if (!transaction) {
        return;
      }

      order.status = orderStatus;
      transaction.status = transactionStatus;

      await manager.save(order);
      await manager.save(transaction);

      webhookEvent.processed = true;
      webhookEvent.processedAt = new Date();

      await manager.save(webhookEvent);
    });
  }

  private normalizePayload(payload: unknown): Record<string, unknown> {
    if (
      typeof payload === 'object' &&
      payload !== null &&
      !Array.isArray(payload)
    ) {
      return payload as Record<string, unknown>;
    }

    return {
      value: payload,
    };
  }
  private getStringField(payload: unknown, field: string): string | null {
    if (
      typeof payload !== 'object' ||
      payload === null ||
      Array.isArray(payload)
    ) {
      return null;
    }

    const value = (payload as Record<string, unknown>)[field];

    return typeof value === 'string' ? value : null;
  }
  private mapOrderStatus(status: string): OrderStatus | null {
    if (status === 'APPROVED') {
      return OrderStatus.APPROVED;
    }

    if (status === 'DENIED') {
      return OrderStatus.DENIED;
    }

    return null;
  }

  private mapTransactionStatus(status: string): TransactionStatus | null {
    if (status === 'APPROVED') {
      return TransactionStatus.APPROVED;
    }

    if (status === 'DENIED') {
      return TransactionStatus.DENIED;
    }

    return null;
  }
}
