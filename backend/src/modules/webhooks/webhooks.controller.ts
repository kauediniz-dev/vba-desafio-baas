import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { WebhooksService } from './webhooks.service';

@ApiTags('Webhooks')
@Controller('webhooks/lera-box')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('pix')
  @ApiOperation({
    summary: 'Receber webhook de PIX',
    description:
      'Recebe atualizações assíncronas de pagamentos PIX enviadas pela Lera Box.',
  })
  @ApiBody({
    schema: {
      example: {
        externalReference: 'PIX-FRONT-001',
        status: 'APPROVED',
      },
    },
  })
  @ApiOkResponse({
    description: 'Webhook recebido com sucesso.',
    schema: {
      example: {
        received: true,
      },
    },
  })
  async handlePixWebhook(
    @Body() payload: unknown,
  ): Promise<{ received: boolean }> {
    await this.webhooksService.handleEvent('PAYMENT_PIX', payload);

    return { received: true };
  }

  @Post('card')
  @ApiOperation({
    summary: 'Receber webhook de cartão',
    description:
      'Recebe atualizações assíncronas de pagamentos com cartão enviadas pela Lera Box.',
  })
  @ApiBody({
    schema: {
      example: {
        externalReference: 'CARD-FRONT-001',
        status: 'DENIED',
      },
    },
  })
  @ApiOkResponse({
    description: 'Webhook recebido com sucesso.',
    schema: {
      example: {
        received: true,
      },
    },
  })
  async handleCardWebhook(
    @Body() payload: unknown,
  ): Promise<{ received: boolean }> {
    await this.webhooksService.handleEvent('PAYMENT_CARD', payload);

    return { received: true };
  }

  @Post('withdrawal')
  @ApiOperation({
    summary: 'Receber webhook de saque',
    description:
      'Recebe atualizações assíncronas de saques enviadas pela Lera Box.',
  })
  @ApiBody({
    schema: {
      example: {
        externalReference: 'SAQUE-FRONT-001',
        status: 'APPROVED',
      },
    },
  })
  @ApiOkResponse({
    description: 'Webhook recebido com sucesso.',
    schema: {
      example: {
        received: true,
      },
    },
  })
  async handleWithdrawalWebhook(
    @Body() payload: unknown,
  ): Promise<{ received: boolean }> {
    await this.webhooksService.handleEvent('WITHDRAWAL', payload);

    return { received: true };
  }
}
