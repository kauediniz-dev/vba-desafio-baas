import { Body, Controller, Param, Post } from '@nestjs/common';

import { CheckoutService } from './checkout.service';
import { CreatePixCheckoutDto } from './dto/create-pix-checkout.dto';
import { CreatePixCheckoutResult } from './interfaces/create-pix-checkout-result.interface';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post(':userId/pix')
  async createPix(
    @Param('userId') userId: string,
    @Body() dto: CreatePixCheckoutDto,
  ): Promise<CreatePixCheckoutResult> {
    return this.checkoutService.createPix(userId, dto);
  }
}
