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
    private readonly httpService: HttpService,

    private readonly configService: ConfigService,

    private readonly tokenCryptoService: TokenCryptoService,

    @InjectRepository(GatewayAccount)
    private readonly gatewayAccountRepository: Repository<GatewayAccount>,

    @InjectRepository(Withdrawal)
    private readonly withdrawalRepository: Repository<Withdrawal>,
  ) {}

  async create(
    userId: string,
    dto: CreateWithdrawalDto,
  ): Promise<CreateWithdrawalResult> {
    const existingWithdrawal = await this.withdrawalRepository.findOne({
      where: {
        externalReference: dto.externalReference,
      },
    });

    if (existingWithdrawal) {
      throw new ConflictException('External reference already exists');
    }

    const gatewayAccount = await this.gatewayAccountRepository.findOne({
      where: { userId },
    });

    if (!gatewayAccount) {
      throw new NotFoundException('Gateway account not found');
    }

    const accessToken = this.tokenCryptoService.decrypt(
      gatewayAccount.accessToken,
    );

    const baseUrl = this.configService.getOrThrow<string>('LERA_BOX_BASE_URL');

    let gatewayResponse: GatewayWithdrawalResponse;

    try {
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

    const status =
      gatewayResponse.status === 'APPROVED'
        ? WithdrawalStatus.APPROVED
        : WithdrawalStatus.DENIED;

    const withdrawal = this.withdrawalRepository.create({
      userId,
      externalReference: gatewayResponse.externalReference,
      gatewayWithdrawalId: gatewayResponse.id,
      amountInCents: gatewayResponse.amount,
      status,
    });

    await this.withdrawalRepository.save(withdrawal);

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

  async findById(
    userId: string,
    withdrawalId: string,
  ): Promise<CreateWithdrawalResult> {
    const withdrawal = await this.withdrawalRepository.findOne({
      where: {
        userId,
        gatewayWithdrawalId: withdrawalId,
      },
    });

    if (!withdrawal) {
      throw new NotFoundException('Withdrawal not found');
    }

    const gatewayAccount = await this.gatewayAccountRepository.findOne({
      where: { userId },
    });

    if (!gatewayAccount) {
      throw new NotFoundException('Gateway account not found');
    }

    const accessToken = this.tokenCryptoService.decrypt(
      gatewayAccount.accessToken,
    );

    const baseUrl = this.configService.getOrThrow<string>('LERA_BOX_BASE_URL');

    let gatewayResponse: GatewayWithdrawalResponse;

    try {
      const response = await firstValueFrom(
        this.httpService.get<GatewayWithdrawalResponse>(
          `${baseUrl}/withdrawals/${withdrawalId}`,
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
        if (error.response?.status === 404) {
          throw new NotFoundException('Withdrawal not found');
        }

        throw new BadGatewayException('Failed to retrieve withdrawal');
      }

      throw error;
    }

    withdrawal.status =
      gatewayResponse.status === 'APPROVED'
        ? WithdrawalStatus.APPROVED
        : WithdrawalStatus.DENIED;

    await this.withdrawalRepository.save(withdrawal);

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
