import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreateWithdrawalDto {
  @ApiProperty({
    example: 15000,
    description: 'Valor do saque em centavos.',
  })
  @IsPositive()
  amount!: number;

  @ApiProperty({
    example: '53720016013',
    description: 'Chave PIX de destino.',
  })
  @IsString()
  @IsNotEmpty()
  pixKey!: string;

  @ApiProperty({
    example: 'Transferência para conta pessoal',
    description: 'Descrição do saque.',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    example: 'SAQUE-FRONT-001',
    description: 'Referência externa usada para conciliação.',
  })
  @IsString()
  @IsNotEmpty()
  externalReference!: string;

  @ApiProperty({
    example: '53720016013',
    description: 'CPF ou CNPJ relacionado à operação.',
  })
  @IsString()
  @IsNotEmpty()
  document!: string;
}
