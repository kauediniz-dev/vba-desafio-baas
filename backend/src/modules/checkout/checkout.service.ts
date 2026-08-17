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
import { DataSource, Repository } from 'typeorm';
import { CreateCardCheckoutDto } from './dto/create-card-checkout.dto';
import { GatewayCardResponse } from './interfaces/gateway-card-response.interface';
import { CreateCardCheckoutResult } from './interfaces/create-card-checkout-result.interface';
import { GatewayAccount } from '../gateway/entities/gateway-account.entity';
import { TokenCryptoService } from '../gateway/services/token-crypto.service';
import { Order } from '../orders/entities/order.entity';
import { OrderStatus } from '../orders/enums/order-status.enum';
import { Transaction } from '../transactions/entities/transaction.entity';
import { TransactionStatus } from '../transactions/enum/transaction-status.enum';
import { TransactionType } from '../transactions/enum/transaction-type.enum';
import {
  CardBrand,
  GatewayFeesResponse,
} from './interfaces/gateway-fees-response.interface';
import { CreatePixCheckoutDto } from './dto/create-pix-checkout.dto';
import { CheckoutLink } from './entities/checkout-link.entity';
import { CheckoutStatus } from './enums/checkout-status.enum';
import { PaymentMethod } from './enums/payment-method.enum';
import { CreatePixCheckoutResult } from './interfaces/create-pix-checkout-result.interface';
import { GatewayPixResponse } from './interfaces/gateway-pix-response.interface';

@Injectable()
export class CheckoutService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly tokenCryptoService: TokenCryptoService,
    private readonly dataSource: DataSource,

    @InjectRepository(GatewayAccount)
    private readonly gatewayAccountRepository: Repository<GatewayAccount>,

    @InjectRepository(CheckoutLink)
    private readonly checkoutLinkRepository: Repository<CheckoutLink>,
  ) {}

  async getCardFees(brand?: CardBrand): Promise<GatewayFeesResponse> {
    const baseUrl = this.configService.getOrThrow<string>('LERA_BOX_BASE_URL');

    try {
      const response = await firstValueFrom(
        this.httpService.get<GatewayFeesResponse>(`${baseUrl}/fees`, {
          params: brand ? { brand } : undefined,
        }),
      );

      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new BadGatewayException('Failed to fetch card fees');
      }

      throw error;
    }
  }

  async createPix(
    userId: string,
    dto: CreatePixCheckoutDto,
  ): Promise<CreatePixCheckoutResult> {
    // Evita que a mesma externalReference seja enviada duas vezes.
    const existingCheckout = await this.checkoutLinkRepository.findOne({
      where: {
        externalReference: dto.externalReference,
      },
    });

    if (existingCheckout) {
      throw new ConflictException('External reference already exists');
    }

    // Recupera a conta do gateway vinculada ao usuário local.
    const gatewayAccount = await this.gatewayAccountRepository.findOne({
      where: { userId },
    });

    if (!gatewayAccount) {
      throw new NotFoundException('Gateway account not found');
    }

    // O Bearer token fica criptografado no banco e só é
    // descriptografado em memória quando precisamos utilizá-lo.
    const accessToken = this.tokenCryptoService.decrypt(
      gatewayAccount.accessToken,
    );

    const baseUrl = this.configService.getOrThrow<string>('LERA_BOX_BASE_URL');

    let gatewayResponse: GatewayPixResponse;

    try {
      const response = await firstValueFrom(
        this.httpService.post<GatewayPixResponse>(
          `${baseUrl}/payments/pix`,
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
        throw new BadGatewayException('Failed to create PIX payment');
      }

      throw error;
    }

    const checkoutStatus =
      gatewayResponse.status === 'APPROVED'
        ? CheckoutStatus.APPROVED
        : CheckoutStatus.DENIED;

    const orderStatus =
      gatewayResponse.status === 'APPROVED'
        ? OrderStatus.APPROVED
        : OrderStatus.DENIED;

    const transactionStatus =
      gatewayResponse.status === 'APPROVED'
        ? TransactionStatus.APPROVED
        : TransactionStatus.DENIED;

    /*
     * Os três registros pertencem ao mesmo fluxo financeiro.
     * Usei uma transaction do banco para garantir que ou todos são persistidos ou nenhum deles é.
     */
    await this.dataSource.transaction(async (manager) => {
      const checkoutLink = manager.create(CheckoutLink, {
        userId,
        externalReference: gatewayResponse.externalReference,
        amountInCents: gatewayResponse.amount,
        paymentMethod: PaymentMethod.PIX,
        status: checkoutStatus,
        feePercent: null,
        installments: null,
        expiresAt: null,
      });

      const savedCheckout = await manager.save(checkoutLink);

      const order = manager.create(Order, {
        checkoutLinkId: savedCheckout.id,
        externalReference: gatewayResponse.externalReference,
        gatewayPaymentId: gatewayResponse.id,
        status: orderStatus,
      });

      const savedOrder = await manager.save(order);

      const transaction = manager.create(Transaction, {
        orderId: savedOrder.id,
        gatewayTransactionId: gatewayResponse.id,
        externalReference: gatewayResponse.externalReference,
        amountInCents: gatewayResponse.amount,
        type: TransactionType.CREDIT,
        status: transactionStatus,
      });

      await manager.save(transaction);
    });

    // Retorna somente informações úteis ao cliente.
    // Credenciais internas do gateway não são expostas.
    return {
      id: gatewayResponse.id,
      status: gatewayResponse.status,
      denialReason: gatewayResponse.denialReason,
      amount: gatewayResponse.amount,
      amountFormatted: gatewayResponse.amountFormatted,
      message: gatewayResponse.message,
      externalReference: gatewayResponse.externalReference,
      txid: gatewayResponse.txid,
      emv: gatewayResponse.emv,
      qrCodeBase64: gatewayResponse.qrCodeBase64,
      copyPaste: gatewayResponse.copyPaste,
    };
  }
  async createCard(
    userId: string,
    dto: CreateCardCheckoutDto,
  ): Promise<CreateCardCheckoutResult> {
    // Impede que a mesma referência seja processada mais de uma vez.
    const existingCheckout = await this.checkoutLinkRepository.findOne({
      where: {
        externalReference: dto.externalReference,
      },
    });

    if (existingCheckout) {
      throw new ConflictException('External reference already exists');
    }

    // Busca a conta do gateway vinculada ao usuário local.
    const gatewayAccount = await this.gatewayAccountRepository.findOne({
      where: { userId },
    });

    if (!gatewayAccount) {
      throw new NotFoundException('Gateway account not found');
    }

    // Recupera o Bearer token somente em memória.
    const accessToken = this.tokenCryptoService.decrypt(
      gatewayAccount.accessToken,
    );

    const baseUrl = this.configService.getOrThrow<string>('LERA_BOX_BASE_URL');

    let gatewayResponse: GatewayCardResponse;

    try {
      const response = await firstValueFrom(
        this.httpService.post<GatewayCardResponse>(
          `${baseUrl}/payments/card`,
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
        throw new BadGatewayException('Failed to create card payment');
      }

      throw error;
    }

    const checkoutStatus =
      gatewayResponse.status === 'APPROVED'
        ? CheckoutStatus.APPROVED
        : CheckoutStatus.DENIED;

    const orderStatus =
      gatewayResponse.status === 'APPROVED'
        ? OrderStatus.APPROVED
        : OrderStatus.DENIED;

    const transactionStatus =
      gatewayResponse.status === 'APPROVED'
        ? TransactionStatus.APPROVED
        : TransactionStatus.DENIED;

    // CheckoutLink, Order e Transaction precisam ser gravados
    // de forma atômica para evitar inconsistências financeiras.
    await this.dataSource.transaction(async (manager) => {
      const checkoutLink = manager.create(CheckoutLink, {
        userId,
        externalReference: gatewayResponse.externalReference,
        amountInCents: gatewayResponse.amount,
        paymentMethod: PaymentMethod.CARD,
        status: checkoutStatus,

        feePercent: gatewayResponse.fee.feePercent.toString(),

        installments: gatewayResponse.fee.installments,

        expiresAt: null,
      });

      const savedCheckout = await manager.save(checkoutLink);

      const order = manager.create(Order, {
        checkoutLinkId: savedCheckout.id,
        externalReference: gatewayResponse.externalReference,
        gatewayPaymentId: gatewayResponse.id,
        status: orderStatus,
      });

      const savedOrder = await manager.save(order);

      const transaction = manager.create(Transaction, {
        orderId: savedOrder.id,
        gatewayTransactionId: gatewayResponse.id,
        externalReference: gatewayResponse.externalReference,
        amountInCents: gatewayResponse.amount,
        type: TransactionType.CREDIT,
        status: transactionStatus,
      });

      await manager.save(transaction);
    });

    // Retorna somente dados úteis ao cliente.
    return {
      id: gatewayResponse.id,
      status: gatewayResponse.status,
      denialReason: gatewayResponse.denialReason,
      amount: gatewayResponse.amount,
      amountFormatted: gatewayResponse.amountFormatted,
      message: gatewayResponse.message,
      externalReference: gatewayResponse.externalReference,
      cardBrand: gatewayResponse.metadata.cardBrand,
      cardLast4: gatewayResponse.metadata.cardLast4,
      installments: gatewayResponse.fee.installments,
      feePercent: gatewayResponse.fee.feePercent,
      feeAmount: gatewayResponse.fee.feeAmount,
      feeAmountFormatted: gatewayResponse.fee.feeAmountFormatted,
      grossAmount: gatewayResponse.fee.grossAmount,
      grossAmountFormatted: gatewayResponse.fee.grossAmountFormatted,
      netAmount: gatewayResponse.fee.netAmount,
      netAmountFormatted: gatewayResponse.fee.netAmountFormatted,
      installmentAmount: gatewayResponse.fee.installmentAmount,
      installmentAmountFormatted:
        gatewayResponse.fee.installmentAmountFormatted,
    };
  }
}
