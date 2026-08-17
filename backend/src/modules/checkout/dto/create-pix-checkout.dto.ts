import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPositive, IsString, Length } from 'class-validator';

export class CreatePixCheckoutDto {
  @ApiProperty({
    example: 25000,
    description: 'Valor da cobrança em centavos.',
  })
  @IsPositive()
  amount!: number;

  @ApiProperty({
    example: 'Compra via PIX',
    description: 'Descrição da cobrança.',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    example: '12345678901',
    description: 'CPF ou CNPJ do pagador.',
  })
  @IsString()
  @Length(11, 14)
  payerDocument!: string;

  @ApiProperty({
    example: 'PIX-FRONT-001',
    description: 'Referência externa usada para conciliação.',
  })
  @IsString()
  @IsNotEmpty()
  externalReference!: string;
}
