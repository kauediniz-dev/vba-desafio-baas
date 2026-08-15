export interface CreatePixCheckoutResult {
  id: string;
  status: 'APPROVED' | 'DENIED';
  denialReason: string | null;
  amount: number;
  amountFormatted: string;
  message: string;
  externalReference: string;
  txid: string;
  emv: string;
  qrCodeBase64: string;
  copyPaste: string;
}
