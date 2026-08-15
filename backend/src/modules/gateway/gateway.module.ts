import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GatewayAccount } from './entities/gateway-account.entity';
import { GatewayService } from './gateway.service';
import { GatewayController } from './gateway.controller';
import { HttpModule } from '@nestjs/axios';
import { TokenCryptoService } from './services/token-crypto.service';

@Module({
  imports: [TypeOrmModule.forFeature([GatewayAccount]), HttpModule],
  controllers: [GatewayController],
  providers: [GatewayService, TokenCryptoService],
  exports: [GatewayService],
})
export class GatewayModule {}
