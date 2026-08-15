import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GatewayAccount } from '../gateway/entities/gateway-account.entity';
import { TokenCryptoService } from '../gateway/services/token-crypto.service';
import { Order } from '../orders/entities/order.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { CheckoutLink } from './entities/checkout-link.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      CheckoutLink,
      GatewayAccount,
      Order,
      Transaction,
    ]),
  ],
  controllers: [CheckoutController],
  providers: [CheckoutService, TokenCryptoService],
  exports: [CheckoutService],
})
export class CheckoutModule {}
