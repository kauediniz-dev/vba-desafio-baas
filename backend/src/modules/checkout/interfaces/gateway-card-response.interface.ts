export interface GatewayCardMetadata {
  method: 'CREDIT_CARD';
  CodigoCliente: number;
  ChaveLoja: string;
  externalReference: string;
  cardBrand: string;
  cardLast4: string;
  cardHolder: string;
  expiryMonth: string;
  expiryYear: string;
  installments: number;
  feePercent: number;
  feeAmountCents: number;
  netAmountCents: number;
  grossAmountCents: number;
  installmentAmountCents: number;
}

export interface GatewayCardFee {
  brand: string;
  installments: number;
  feePercent: number;
  feeAmount: number;
  feeAmountFormatted: string;
  grossAmount: number;
  grossAmountFormatted: string;
  netAmount: number;
  netAmountFormatted: string;
  installmentAmount: number;
  installmentAmountFormatted: string;
}

export interface GatewayCardResponse {
  id: string;
  type: 'CREDIT_CARD';
  status: 'APPROVED' | 'DENIED';
  denialReason: string | null;
  amount: number;
  amountFormatted: string;
  description: string;
  message: string;
  metadata: GatewayCardMetadata;
  createdAt: string;
  externalReference: string;
  CodigoCliente: number;
  ChaveLoja: string;
  walletBalance: number;
  walletBalanceFormatted: string;
  fee: GatewayCardFee;
}
