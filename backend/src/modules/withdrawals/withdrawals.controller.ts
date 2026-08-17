import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import type { AuthenticatedRequest } from '../auth/guards/jwt-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { CreateWithdrawalResult } from './interfaces/create-withdrawal-result.interface';
import { WithdrawalsService } from './withdrawals.service';

@Controller('withdrawals')
export class WithdrawalsController {
  constructor(private readonly withdrawalsService: WithdrawalsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateWithdrawalDto,
  ): Promise<CreateWithdrawalResult> {
    return this.withdrawalsService.create(request.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findById(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<CreateWithdrawalResult> {
    return this.withdrawalsService.findById(request.user.sub, id);
  }
}
