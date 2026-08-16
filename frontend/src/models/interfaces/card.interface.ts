export interface CardResult {
  id: string;
  status: "APPROVED" | "DENIED";
  denialReason: string | null;
  amount: number;
  amountFormatted: string;
  message: string;
  externalReference: string;
  cardBrand: string;
  cardLast4: string;
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
