export interface GatewayWithdrawalMetadata {
  pixKey: string;
  document: string;
  externalReference: string;
  CodigoCliente: number;
  ChaveLoja: string;
}

export interface GatewayWithdrawalResponse {
  id: string;
  type: 'WITHDRAWAL';
  status: 'APPROVED' | 'DENIED';
  denialReason: string | null;
  amount: number;
  amountFormatted: string;
  description: string;
  message: string;
  metadata: GatewayWithdrawalMetadata;
  createdAt: string;
  externalReference: string;
  CodigoCliente: number;
  ChaveLoja: string;
  walletBalance: number;
  walletBalanceFormatted: string;
}
