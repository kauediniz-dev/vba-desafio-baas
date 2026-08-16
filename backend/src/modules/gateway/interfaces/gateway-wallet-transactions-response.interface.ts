export type GatewayTransactionType = 'PIX' | 'CREDIT_CARD' | 'WITHDRAWAL';

export type GatewayTransactionStatus =
  'PENDING' | 'APPROVED' | 'DENIED' | 'EXPIRED' | 'CANCELLED';

export interface GatewayWalletTransaction {
  id: string;
  type: GatewayTransactionType;
  status: GatewayTransactionStatus;
  denialReason: string | null;
  amount: number;
  amountFormatted: string;
  description: string;
  message: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface GatewayWalletTransactionsResponse {
  walletId: string;
  balance: number;
  balanceFormatted: string;
  filters: {
    status: GatewayTransactionStatus | null;
    type: GatewayTransactionType | null;
  };
  transactions: GatewayWalletTransaction[];
}
