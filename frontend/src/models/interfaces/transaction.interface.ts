export type TransactionType = "PIX" | "CREDIT_CARD" | "WITHDRAWAL";

export type TransactionStatus =
  | "PENDING"
  | "APPROVED"
  | "DENIED"
  | "EXPIRED"
  | "CANCELLED";

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  denialReason: string | null;
  amount: number;
  amountFormatted: string;
  description: string;
  message: string;
  createdAt: string;
  externalReference?: string;
}

export interface TransactionsResponse {
  walletId: string;
  balance: number;
  balanceFormatted: string;
  filters: {
    status: string | null;
    type: string | null;
  };
  transactions: Transaction[];
}
