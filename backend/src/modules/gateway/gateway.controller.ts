import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';

import type { AuthenticatedRequest } from '../auth/guards/jwt-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WalletTransactionsQueryDto } from './dto/wallet-transactions-query.dto';
import { GatewayService } from './gateway.service';
import { WalletTransactionsResult } from './interfaces/wallet-transactions-result.interface';

@Controller('gateway')
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @UseGuards(JwtAuthGuard)
  @Get('wallet')
  async getWallet(@Req() request: AuthenticatedRequest) {
    return this.gatewayService.getWallet(request.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('wallet/transactions')
  async getWalletTransactions(
    @Req() request: AuthenticatedRequest,
    @Query() query: WalletTransactionsQueryDto,
  ): Promise<WalletTransactionsResult> {
    return this.gatewayService.getWalletTransactions(request.user.sub, query);
  }
}
