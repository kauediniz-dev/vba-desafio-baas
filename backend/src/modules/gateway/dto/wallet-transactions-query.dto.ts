import { IsIn, IsOptional, IsString } from 'class-validator';

export class WalletTransactionsQueryDto {
  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsIn(['PENDING', 'APPROVED', 'DENIED', 'EXPIRED', 'CANCELLED'])
  status?: string;

  @IsOptional()
  @IsIn(['PIX', 'CREDIT_CARD', 'WITHDRAWAL'])
  type?: string;
}
