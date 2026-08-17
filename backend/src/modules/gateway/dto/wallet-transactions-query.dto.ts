import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class WalletTransactionsQueryDto {
  @ApiPropertyOptional({
    example: '20',
    description: 'Quantidade máxima de transações retornadas.',
  })
  @IsOptional()
  @IsString()
  limit?: string;

  @ApiPropertyOptional({
    enum: ['PENDING', 'APPROVED', 'DENIED', 'EXPIRED', 'CANCELLED'],
    example: 'APPROVED',
    description: 'Filtra as transações pelo status.',
  })
  @IsOptional()
  @IsIn(['PENDING', 'APPROVED', 'DENIED', 'EXPIRED', 'CANCELLED'])
  status?: string;

  @ApiPropertyOptional({
    enum: ['PIX', 'CREDIT_CARD', 'WITHDRAWAL'],
    example: 'PIX',
    description: 'Filtra as transações pelo tipo.',
  })
  @IsOptional()
  @IsIn(['PIX', 'CREDIT_CARD', 'WITHDRAWAL'])
  type?: string;
}
