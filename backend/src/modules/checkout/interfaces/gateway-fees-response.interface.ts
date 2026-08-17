export type CardBrand = 'VISA' | 'MASTERCARD' | 'ELO';

export interface GatewayFee {
  id: string;
  brand: CardBrand;
  installments: number;
  feePercent: number;
  feePercentFormatted: string;
}

export interface GatewayFeesResponse {
  total: number;
  fees: GatewayFee[];
}
