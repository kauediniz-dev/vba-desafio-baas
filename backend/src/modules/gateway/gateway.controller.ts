import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { GatewayLoginDto } from './dto/gateway-login.dto';
import { GatewayService } from './gateway.service';

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
}
