import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GatewayAccount } from '../gateway/entities/gateway-account.entity';
import { TokenCryptoService } from '../gateway/services/token-crypto.service';
import { Withdrawal } from './entities/withdrawal.entity';
import { WithdrawalsController } from './withdrawals.controller';
import { WithdrawalsService } from './withdrawals.service';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Withdrawal, GatewayAccount])],
  controllers: [WithdrawalsController],
  providers: [WithdrawalsService, TokenCryptoService],
})
export class WithdrawalsModule {}
