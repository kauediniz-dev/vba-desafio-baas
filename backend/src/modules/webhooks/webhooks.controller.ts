import { Body, Controller, Post } from '@nestjs/common';

import { WebhooksService } from './webhooks.service';

@Controller('webhooks/lera-box')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('pix')
  async handlePixWebhook(
    @Body() payload: unknown,
  ): Promise<{ received: boolean }> {
    await this.webhooksService.handleEvent('PAYMENT_PIX', payload);

    return {
      received: true,
    };
  }
}
