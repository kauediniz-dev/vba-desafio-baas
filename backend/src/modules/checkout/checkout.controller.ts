import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import type { AuthenticatedRequest } from '../auth/guards/jwt-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { CheckoutService } from './checkout.service';
import { CreateCardCheckoutDto } from './dto/create-card-checkout.dto';
import { CreatePixCheckoutDto } from './dto/create-pix-checkout.dto';
import { CreateCardCheckoutResult } from './interfaces/create-card-checkout-result.interface';
import { CreatePixCheckoutResult } from './interfaces/create-pix-checkout-result.interface';
import type { CardBrand } from './interfaces/gateway-fees-response.interface';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @UseGuards(JwtAuthGuard)
  @Post('pix')
  async createPix(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreatePixCheckoutDto,
  ): Promise<CreatePixCheckoutResult> {
    return this.checkoutService.createPix(request.user.sub, dto);
  }

  @Get('fees')
  getCardFees(@Query('brand') brand?: CardBrand) {
    return this.checkoutService.getCardFees(brand);
  }

  @UseGuards(JwtAuthGuard)
  @Post('card')
  async createCard(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateCardCheckoutDto,
  ): Promise<CreateCardCheckoutResult> {
    return this.checkoutService.createCard(request.user.sub, dto);
  }
}
