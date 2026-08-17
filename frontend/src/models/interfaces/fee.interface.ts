export type CardBrand = "VISA" | "MASTERCARD" | "ELO";

export interface CardFee {
  id: string;
  brand: CardBrand;
  installments: number;
  feePercent: number;
  feePercentFormatted: string;
}

export interface FeesResponse {
  total: number;
  fees: CardFee[];
}
