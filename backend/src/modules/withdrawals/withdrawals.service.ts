import { HttpService } from '@nestjs/axios';
import {
  BadGatewayException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';

import { GatewayAccount } from '../gateway/entities/gateway-account.entity';
import { TokenCryptoService } from '../gateway/services/token-crypto.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { Withdrawal } from './entities/withdrawal.entity';
import { WithdrawalStatus } from './enum/withdrawal-status.enum';
import { CreateWithdrawalResult } from './interfaces/create-withdrawal-result.interface';
import { GatewayWithdrawalResponse } from './interfaces/gateway-withdrawal-response.interface';

@Injectable()
export class WithdrawalsService {
  constructor(
    // Cliente HTTP usado para chamar a API da BranchPay.
    private readonly httpService: HttpService,

    // Permite acessar configurações da aplicação, como a URL do gateway.
    private readonly configService: ConfigService,

    // Serviço usado para descriptografar o Bearer token salvo no banco.
    private readonly tokenCryptoService: TokenCryptoService,

    // Repository da conta do gateway.
    @InjectRepository(GatewayAccount)
    private readonly gatewayAccountRepository: Repository<GatewayAccount>,

    // Repository responsável pela tabela withdrawals.
    @InjectRepository(Withdrawal)
    private readonly withdrawalRepository: Repository<Withdrawal>,
  ) {}

  /**
   * Solicita um saque no gateway externo e registra o resultado
   * no banco de dados local.
   */
  async create(
    userId: string,
    dto: CreateWithdrawalDto,
  ): Promise<CreateWithdrawalResult> {
    // Evita processar duas vezes a mesma referência.
    const existingWithdrawal = await this.withdrawalRepository.findOne({
      where: {
        externalReference: dto.externalReference,
      },
    });

    if (existingWithdrawal) {
      throw new ConflictException('External reference already exists');
    }

    // Recupera a conta do gateway relacionada ao usuário local.
    const gatewayAccount = await this.gatewayAccountRepository.findOne({
      where: { userId },
    });

    if (!gatewayAccount) {
      throw new NotFoundException('Gateway account not found');
    }

    // O token permanece criptografado no banco e só é
    // descriptografado em memória no momento da requisição.
    const accessToken = this.tokenCryptoService.decrypt(
      gatewayAccount.accessToken,
    );

    const baseUrl = this.configService.getOrThrow<string>('LERA_BOX_BASE_URL');

    let gatewayResponse: GatewayWithdrawalResponse;

    try {
      // Solicita o saque na BranchPay.
      const response = await firstValueFrom(
        this.httpService.post<GatewayWithdrawalResponse>(
          `${baseUrl}/withdrawals`,
          dto,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        ),
      );

      gatewayResponse = response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new BadGatewayException('Failed to create withdrawal');
      }

      throw error;
    }

    // Traduz o status externo para o enum usado internamente.
    const status =
      gatewayResponse.status === 'APPROVED'
        ? WithdrawalStatus.APPROVED
        : WithdrawalStatus.DENIED;

    // Salva apenas os dados necessários para rastrear o saque.
    const withdrawal = this.withdrawalRepository.create({
      userId,
      externalReference: gatewayResponse.externalReference,
      gatewayWithdrawalId: gatewayResponse.id,
      amountInCents: gatewayResponse.amount,
      status,
    });

    await this.withdrawalRepository.save(withdrawal);

    // Retorna somente os dados seguros e úteis para o cliente.
    return {
      id: gatewayResponse.id,
      status: gatewayResponse.status,
      denialReason: gatewayResponse.denialReason,
      amount: gatewayResponse.amount,
      amountFormatted: gatewayResponse.amountFormatted,
      description: gatewayResponse.description,
      message: gatewayResponse.message,
      externalReference: gatewayResponse.externalReference,
      walletBalance: gatewayResponse.walletBalance,
      walletBalanceFormatted: gatewayResponse.walletBalanceFormatted,
      createdAt: gatewayResponse.createdAt,
    };
  }
}
