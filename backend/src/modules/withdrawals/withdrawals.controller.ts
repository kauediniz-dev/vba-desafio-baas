import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadGatewayResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import type { AuthenticatedRequest } from '../auth/guards/jwt-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { CreateWithdrawalResult } from './interfaces/create-withdrawal-result.interface';
import { WithdrawalsService } from './withdrawals.service';

@ApiTags('Withdrawals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('withdrawals')
export class WithdrawalsController {
  constructor(private readonly withdrawalsService: WithdrawalsService) {}

  @Post()
  @ApiOperation({
    summary: 'Solicitar saque via PIX',
    description:
      'Solicita um saque no gateway para uma chave PIX e registra o resultado localmente.',
  })
  @ApiOkResponse({
    description: 'Saque processado pelo gateway.',
    schema: {
      example: {
        id: 'b6d44828-5724-48c6-8341-c2fcb36bc57e',
        status: 'APPROVED',
        denialReason: null,
        amount: 15000,
        amountFormatted: 'R$ 150,00',
        description: 'Transferência para conta pessoal',
        message: 'Transação realizada com sucesso',
        externalReference: 'SAQUE-FRONT-001',
        walletBalance: 70007,
        walletBalanceFormatted: 'R$ 700,07',
        createdAt: '2026-08-17T03:59:20.752Z',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'JWT ausente, inválido ou expirado.',
  })
  @ApiConflictResponse({
    description: 'Referência externa já utilizada.',
  })
  @ApiNotFoundResponse({
    description: 'Conta do gateway não encontrada.',
  })
  @ApiBadGatewayResponse({
    description: 'Falha ao solicitar saque no gateway.',
  })
  async create(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateWithdrawalDto,
  ): Promise<CreateWithdrawalResult> {
    return this.withdrawalsService.create(request.user.sub, dto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Consultar status de um saque',
    description:
      'Consulta no gateway um saque previamente criado pelo usuário autenticado.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador do saque retornado pelo gateway.',
    example: 'b6d44828-5724-48c6-8341-c2fcb36bc57e',
  })
  @ApiOkResponse({
    description: 'Saque consultado com sucesso.',
    schema: {
      example: {
        id: 'b6d44828-5724-48c6-8341-c2fcb36bc57e',
        status: 'APPROVED',
        denialReason: null,
        amount: 15000,
        amountFormatted: 'R$ 150,00',
        description: 'Transferência para conta pessoal',
        message: 'Transação realizada com sucesso',
        externalReference: 'SAQUE-FRONT-001',
        walletBalance: 70007,
        walletBalanceFormatted: 'R$ 700,07',
        createdAt: '2026-08-17T03:59:20.752Z',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'JWT ausente, inválido ou expirado.',
  })
  @ApiNotFoundResponse({
    description: 'Saque não encontrado para o usuário autenticado.',
  })
  @ApiBadGatewayResponse({
    description: 'Falha ao consultar o saque no gateway.',
  })
  findById(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<CreateWithdrawalResult> {
    return this.withdrawalsService.findById(request.user.sub, id);
  }
}
