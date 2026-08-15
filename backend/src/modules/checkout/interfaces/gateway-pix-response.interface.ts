export interface GatewayPixMetadata {
  method: 'PIX';
  CodigoCliente: string | number;
  ChaveLoja: string;
  payerDocument: string;
  externalReference: string;
  txid: string;
  emv: string;
  qrCodeBase64: string;
}

export interface GatewayPixResponse {
  id: string;
  type: 'PIX';
  status: 'APPROVED' | 'DENIED';
  denialReason: string | null;
  amount: number;
  amountFormatted: string;
  description: string;
  message: string;
  metadata: GatewayPixMetadata;
  createdAt: string;
  externalReference: string;
  CodigoCliente: string | number;
  ChaveLoja: string;
  walletBalance: number;
  walletBalanceFormatted: string;
  txid: string;
  emv: string;
  qrCodeBase64: string;
  copyPaste: string;
}
