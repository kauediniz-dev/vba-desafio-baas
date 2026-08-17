import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiBadGatewayResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import type { AuthenticatedRequest } from '../auth/guards/jwt-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WalletTransactionsQueryDto } from './dto/wallet-transactions-query.dto';
import { GatewayService } from './gateway.service';
import { WalletTransactionsResult } from './interfaces/wallet-transactions-result.interface';

@ApiTags('Gateway')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('gateway')
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Get('wallet')
  @ApiOperation({
    summary: 'Consultar saldo da carteira',
    description:
      'Consulta no gateway o saldo da carteira vinculada ao usuário autenticado.',
  })
  @ApiOkResponse({
    description: 'Carteira consultada com sucesso.',
    schema: {
      example: {
        balance: 55007,
        balanceFormatted: 'R$ 550,07',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'JWT ausente, inválido ou expirado.',
  })
  @ApiNotFoundResponse({
    description: 'Conta do gateway não encontrada para o usuário.',
  })
  @ApiBadGatewayResponse({
    description: 'Falha ao consultar a carteira no gateway externo.',
  })
  async getWallet(@Req() request: AuthenticatedRequest) {
    return this.gatewayService.getWallet(request.user.sub);
  }

  @Get('wallet/transactions')
  @ApiOperation({
    summary: 'Consultar extrato de transações',
    description:
      'Consulta as transações da carteira no gateway, permitindo filtros por status e tipo.',
  })
  @ApiOkResponse({
    description: 'Extrato consultado com sucesso.',
    schema: {
      example: {
        transactions: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            type: 'PIX',
            status: 'APPROVED',
            amount: 10000,
            amountFormatted: 'R$ 100,00',
            description: 'Pagamento PIX',
            externalReference: 'PIX-FRONT-001',
            createdAt: '2026-08-17T03:59:20.752Z',
          },
        ],
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'JWT ausente, inválido ou expirado.',
  })
  @ApiNotFoundResponse({
    description: 'Conta do gateway não encontrada para o usuário.',
  })
  @ApiBadGatewayResponse({
    description: 'Falha ao consultar as transações no gateway externo.',
  })
  async getWalletTransactions(
    @Req() request: AuthenticatedRequest,
    @Query() query: WalletTransactionsQueryDto,
  ): Promise<WalletTransactionsResult> {
    return this.gatewayService.getWalletTransactions(request.user.sub, query);
  }
}
