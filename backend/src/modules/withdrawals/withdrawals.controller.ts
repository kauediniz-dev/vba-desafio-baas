import { Body, Controller, Param, Post } from '@nestjs/common';

import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { CreateWithdrawalResult } from './interfaces/create-withdrawal-result.interface';
import { WithdrawalsService } from './withdrawals.service';

@Controller('withdrawals')
export class WithdrawalsController {
  constructor(private readonly withdrawalsService: WithdrawalsService) {}

  @Post(':userId')
  async create(
    @Param('userId') userId: string,
    @Body() dto: CreateWithdrawalDto,
  ): Promise<CreateWithdrawalResult> {
    return await this.withdrawalsService.create(userId, dto);
  }
}
