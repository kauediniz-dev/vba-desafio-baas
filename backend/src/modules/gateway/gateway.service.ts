import { HttpService } from '@nestjs/axios';
import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { AxiosError, AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import {
  WalletTransactionResult,
  WalletTransactionsResult,
} from './interfaces/wallet-transactions-result.interface';
import { GatewayLoginDto } from './dto/gateway-login.dto';
import { GatewayAccount } from './entities/gateway-account.entity';
import { GatewayLoginResponse } from './interfaces/gateway-login-response.interface';
import { GatewayWalletResponse } from './interfaces/gateway-wallet-response.interface';
import { TokenCryptoService } from './services/token-crypto.service';
import { WalletTransactionsQueryDto } from './dto/wallet-transactions-query.dto';
import { GatewayWalletTransactionsResponse } from './interfaces/gateway-wallet-transactions-response.interface';

@Injectable()
export class GatewayService {
  constructor(
    // Serviço HTTP usado para realizar requisições para a API externa.
    private readonly httpService: HttpService,

    // Serviço responsável por criptografar e descriptografar o access token.
    private readonly tokenCryptoService: TokenCryptoService,

    // Serviço usado para acessar as variáveis de ambiente da aplicação.
    private readonly configService: ConfigService,

    // Repository do TypeORM usado para acessar a tabela gateway_accounts.
    @InjectRepository(GatewayAccount)
    private readonly gatewayAccountRepository: Repository<GatewayAccount>,
  ) {}

  /**
   * Após o login:
   * - recebe o access token do gateway;
   * - criptografa o token;
   * - cria ou atualiza a GatewayAccount do usuário;
   * - salva as credenciais necessárias no banco.
   */
  async login(userId: string, dto: GatewayLoginDto): Promise<void> {
    // Recupera a URL base da API externa através do .env.
    const baseUrl = this.configService.getOrThrow<string>('LERA_BOX_BASE_URL');

    let response: AxiosResponse<GatewayLoginResponse>;

    try {
      // Envia documento e senha para o endpoint de autenticação
      // do gateway externo.
      response = await firstValueFrom(
        this.httpService.post<GatewayLoginResponse>(
          `${baseUrl}/auth/login`,
          dto,
        ),
      );
    } catch (error: unknown) {
      // Converte erros do Axios/gateway em exceções HTTP controladas
      // pela nossa própria API.
      this.handleGatewayError(error);
    }

    // O token precisa ser recuperado posteriormente para realizar
    // outras chamadas ao gateway
    const encryptedToken = this.tokenCryptoService.encrypt(
      response.data.access_token,
    );

    // Procura uma conta do gateway já associada ao usuário local.
    let gatewayAccount = await this.gatewayAccountRepository.findOne({
      where: { userId },
    });

    if (!gatewayAccount) {
      // Se o usuário ainda não possui uma conta do gateway registrada,
      // cria uma nova entidade.
      gatewayAccount = this.gatewayAccountRepository.create({
        userId,
        codigoCliente: response.data.codigoCliente,
        chaveLoja: response.data.chaveLoja,
        accessToken: encryptedToken,
      });
    } else {
      // Se já existe uma GatewayAccount para o usuário,
      // atualizamos as credenciais em vez de criar outra linha.
      gatewayAccount.codigoCliente = response.data.codigoCliente;

      gatewayAccount.chaveLoja = response.data.chaveLoja;

      gatewayAccount.accessToken = encryptedToken;
    }

    // Persiste a nova conta ou as alterações realizadas
    // na conta existente.
    await this.gatewayAccountRepository.save(gatewayAccount);
  }

  /**
   * O token armazenado no banco está criptografado.
   * Ele é descriptografado apenas em memória no momento
   * em que precisamos realizar a requisição autenticada.
   */
  async getWallet(userId: string): Promise<GatewayWalletResponse> {
    // Busca a conta do gateway associada ao usuário local.
    const gatewayAccount = await this.gatewayAccountRepository.findOne({
      where: { userId },
    });

    // Sem uma GatewayAccount não temos credenciais para
    // realizar chamadas autenticadas ao gateway.
    if (!gatewayAccount) {
      throw new NotFoundException('Gateway account not found');
    }

    // Recupera temporariamente o access token original.
    // O token descriptografado permanece apenas em memória
    // durante a execução da requisição.
    const accessToken = this.tokenCryptoService.decrypt(
      gatewayAccount.accessToken,
    );

    // Recupera novamente a URL base da API externa.
    const baseUrl = this.configService.getOrThrow<string>('LERA_BOX_BASE_URL');

    let response: AxiosResponse<GatewayWalletResponse>;

    try {
      // Consulta a carteira utilizando o Bearer token
      // descriptografado anteriormente.
      response = await firstValueFrom(
        this.httpService.get<GatewayWalletResponse>(`${baseUrl}/wallet`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }),
      );
    } catch (error: unknown) {
      // Padroniza possíveis erros retornados pelo gateway.
      this.handleGatewayError(error);
    }

    // Retorna somente os dados da carteira.
    // O access token nunca é enviado ao cliente.
    return response.data;
  }

  /**
   * Recupera um campo string do metadata retornado pelo gateway.
   *
   * Como o metadata externo é do tipo Record<string, unknown>,
   * validamos o tipo antes de utilizar o valor.
   */
  private getMetadataString(
    metadata: Record<string, unknown>,
    field: string,
  ): string | null {
    const value = metadata[field];

    return typeof value === 'string' ? value : null;
  }

  /**
   * Recupera um campo numérico do metadata retornado pelo gateway.
   *
   * Isso evita casts inseguros de valores provenientes
   * da API externa.
   */
  private getMetadataNumber(
    metadata: Record<string, unknown>,
    field: string,
  ): number | null {
    const value = metadata[field];

    return typeof value === 'number' ? value : null;
  }

  async getWalletTransactions(
    userId: string,
    query: WalletTransactionsQueryDto,
  ): Promise<WalletTransactionsResult> {
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

    try {
      const response = await firstValueFrom(
        this.httpService.get<GatewayWalletTransactionsResponse>(
          `${baseUrl}/wallet/transactions`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            params: {
              limit: query.limit,
              status: query.status,
              type: query.type,
            },
          },
        ),
      );

      const transactions = response.data.transactions.map(
        (transaction): WalletTransactionResult => {
          const metadata = transaction.metadata;

          const result: WalletTransactionResult = {
            id: transaction.id,
            type: transaction.type,
            status: transaction.status,
            denialReason: transaction.denialReason,
            amount: transaction.amount,
            amountFormatted: transaction.amountFormatted,
            description: transaction.description,
            message: transaction.message,
            createdAt: transaction.createdAt,
          };

          const externalReference = this.getMetadataString(
            metadata,
            'externalReference',
          );

          if (externalReference) {
            result.externalReference = externalReference;
          }

          if (transaction.type === 'CREDIT_CARD') {
            const cardBrand = this.getMetadataString(metadata, 'cardBrand');

            const cardLast4 = this.getMetadataString(metadata, 'cardLast4');

            const installments = this.getMetadataNumber(
              metadata,
              'installments',
            );

            const feePercent = this.getMetadataNumber(metadata, 'feePercent');

            const feeAmountCents = this.getMetadataNumber(
              metadata,
              'feeAmountCents',
            );

            const netAmountCents = this.getMetadataNumber(
              metadata,
              'netAmountCents',
            );

            const grossAmountCents = this.getMetadataNumber(
              metadata,
              'grossAmountCents',
            );

            const installmentAmountCents = this.getMetadataNumber(
              metadata,
              'installmentAmountCents',
            );

            if (cardBrand) {
              result.cardBrand = cardBrand;
            }

            if (cardLast4) {
              result.cardLast4 = cardLast4;
            }

            if (installments !== null) {
              result.installments = installments;
            }

            if (feePercent !== null) {
              result.feePercent = feePercent;
            }

            if (feeAmountCents !== null) {
              result.feeAmountCents = feeAmountCents;
            }

            if (netAmountCents !== null) {
              result.netAmountCents = netAmountCents;
            }

            if (grossAmountCents !== null) {
              result.grossAmountCents = grossAmountCents;
            }

            if (installmentAmountCents !== null) {
              result.installmentAmountCents = installmentAmountCents;
            }
          }

          if (transaction.type === 'PIX') {
            const txid = this.getMetadataString(metadata, 'txid');

            if (txid) {
              result.txid = txid;
            }
          }

          return result;
        },
      );

      return {
        walletId: response.data.walletId,
        balance: response.data.balance,
        balanceFormatted: response.data.balanceFormatted,
        filters: response.data.filters,
        transactions,
      };
    } catch (error: unknown) {
      this.handleGatewayError(error);
    }
  }
  /**
   * Converte erros provenientes do gateway externo
   * em exceções HTTP controladas pela nossa API.
   *
   * O retorno é "never" porque esse método sempre
   * lança uma exceção e nunca retorna normalmente.
   */
  private handleGatewayError(error: unknown): never {
    if (error instanceof AxiosError) {
      const status = error.response?.status;

      // A API externa rejeitou os dados enviados.
      if (status === 400) {
        throw new BadRequestException('Invalid gateway request');
      }

      // As credenciais ou o Bearer token não foram aceitos.
      if (status === 401) {
        throw new UnauthorizedException('Invalid gateway credentials');
      }
    }

    // Qualquer outra falha da integração é representada como 502.
    // Isso indica que nossa API está funcionando, mas houve
    // problema ao se comunicar com o serviço externo.
    throw new BadGatewayException('Gateway service unavailable');
  }
}
