import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GatewayAccount } from './entities/gateway-account.entity';
import { GatewayService } from './gateway.service';

@Module({
  imports: [TypeOrmModule.forFeature([GatewayAccount])],
  providers: [GatewayService],
  exports: [GatewayService],
})
export class GatewayModule {}
