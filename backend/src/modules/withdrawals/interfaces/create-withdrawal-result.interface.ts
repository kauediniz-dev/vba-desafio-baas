export interface CreateWithdrawalResult {
  id: string;
  status: 'APPROVED' | 'DENIED';
  denialReason: string | null;
  amount: number;
  amountFormatted: string;
  description: string;
  message: string;
  externalReference: string;
  walletBalance: number;
  walletBalanceFormatted: string;
  createdAt: string;
}
