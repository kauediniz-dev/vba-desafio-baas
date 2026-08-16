import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

import { GatewayLoginDto } from './dto/gateway-login.dto';
import { WalletTransactionsQueryDto } from './dto/wallet-transactions-query.dto';
import { GatewayService } from './gateway.service';
import { WalletTransactionsResult } from './interfaces/wallet-transactions-result.interface';

@Controller('gateway')
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Post(':userId/login')
  async login(
    @Param('userId') userId: string,
    @Body() dto: GatewayLoginDto,
  ): Promise<{ message: string }> {
    await this.gatewayService.login(userId, dto);

    return {
      message: 'Gateway authenticated successfully',
    };
  }

  @Get(':userId/wallet')
  async getWallet(@Param('userId') userId: string) {
    return this.gatewayService.getWallet(userId);
  }

  @Get(':userId/wallet/transactions')
  async getWalletTransactions(
    @Param('userId') userId: string,
    @Query() query: WalletTransactionsQueryDto,
  ): Promise<WalletTransactionsResult> {
    return await this.gatewayService.getWalletTransactions(userId, query);
  }
}
