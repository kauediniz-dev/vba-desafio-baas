import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GatewayAccount } from './entities/gateway-account.entity';

@Injectable()
export class GatewayService {
  constructor(
    @InjectRepository(GatewayAccount) // Inject repositório do TypeORM para a entidade GatewayAccount
    private readonly gatewayAccountRepository: Repository<GatewayAccount>,
  ) {}
}
