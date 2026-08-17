import {
  Body,
  Controller,
  Get,
  Post,
  Query,
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
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import type { AuthenticatedRequest } from '../auth/guards/jwt-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { CheckoutService } from './checkout.service';
import { CreateCardCheckoutDto } from './dto/create-card-checkout.dto';
import { CreatePixCheckoutDto } from './dto/create-pix-checkout.dto';
import { CreateCardCheckoutResult } from './interfaces/create-card-checkout-result.interface';
import { CreatePixCheckoutResult } from './interfaces/create-pix-checkout-result.interface';
import type { CardBrand } from './interfaces/gateway-fees-response.interface';

@ApiTags('Checkout')
@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('pix')
  @ApiOperation({
    summary: 'Criar pagamento PIX',
    description:
      'Cria uma cobrança PIX no gateway para o usuário autenticado e persiste os dados da operação localmente.',
  })
  @ApiOkResponse({
    description: 'Pagamento PIX criado com sucesso.',
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
    description: 'Falha ao criar pagamento PIX no gateway.',
  })
  async createPix(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreatePixCheckoutDto,
  ): Promise<CreatePixCheckoutResult> {
    return this.checkoutService.createPix(request.user.sub, dto);
  }

  @Get('fees')
  @ApiOperation({
    summary: 'Consultar taxas de cartão',
    description:
      'Consulta a tabela de taxas do gateway, opcionalmente filtrada pela bandeira.',
  })
  @ApiQuery({
    name: 'brand',
    required: false,
    enum: ['VISA', 'MASTERCARD', 'ELO'],
    example: 'VISA',
  })
  @ApiOkResponse({
    description: 'Taxas consultadas com sucesso.',
    schema: {
      example: {
        total: 2,
        fees: [
          {
            id: 'fee-id',
            brand: 'VISA',
            installments: 1,
            feePercent: 2.49,
            feePercentFormatted: '2,49%',
          },
          {
            id: 'fee-id-2',
            brand: 'VISA',
            installments: 5,
            feePercent: 3.89,
            feePercentFormatted: '3,89%',
          },
        ],
      },
    },
  })
  @ApiBadGatewayResponse({
    description: 'Falha ao consultar as taxas no gateway.',
  })
  getCardFees(@Query('brand') brand?: CardBrand) {
    return this.checkoutService.getCardFees(brand);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('card')
  @ApiOperation({
    summary: 'Criar pagamento com cartão',
    description:
      'Cria um pagamento com cartão usando a quantidade de parcelas e a taxa correspondente retornada pela tabela do gateway.',
  })
  @ApiOkResponse({
    description: 'Pagamento com cartão processado.',
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
    description: 'Falha ao criar pagamento com cartão no gateway.',
  })
  async createCard(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateCardCheckoutDto,
  ): Promise<CreateCardCheckoutResult> {
    return this.checkoutService.createCard(request.user.sub, dto);
  }
}
