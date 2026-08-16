import {
  GatewayTransactionStatus,
  GatewayTransactionType,
} from './gateway-wallet-transactions-response.interface';

export interface WalletTransactionResult {
  id: string;
  type: GatewayTransactionType;
  status: GatewayTransactionStatus;
  denialReason: string | null;
  amount: number;
  amountFormatted: string;
  description: string;
  message: string;
  createdAt: string;

  externalReference?: string;
  cardBrand?: string;
  cardLast4?: string;
  installments?: number;
  feePercent?: number;
  feeAmountCents?: number;
  netAmountCents?: number;
  grossAmountCents?: number;
  installmentAmountCents?: number;

  txid?: string;
}

export interface WalletTransactionsResult {
  walletId: string;
  balance: number;
  balanceFormatted: string;
  filters: {
    status: GatewayTransactionStatus | null;
    type: GatewayTransactionType | null;
  };
  transactions: WalletTransactionResult[];
}
