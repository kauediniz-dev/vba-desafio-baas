import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class CreateCardCheckoutDto {
  @ApiProperty({
    example: 25000,
    description: 'Valor da cobrança em centavos.',
  })
  @IsPositive()
  amount!: number;

  @ApiProperty({
    example: 'Compra no cartão',
    description: 'Descrição da cobrança.',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    example: 'CARD-FRONT-001',
    description: 'Referência externa usada para conciliação.',
  })
  @IsString()
  @IsNotEmpty()
  externalReference!: string;

  @ApiProperty({
    example: '4111111111111111',
    description: 'Número do cartão sem espaços.',
    writeOnly: true,
  })
  @IsString()
  @Length(13, 19)
  cardNumber!: string;

  @ApiProperty({
    example: 'Maria Silva',
    description: 'Nome do titular conforme consta no cartão.',
  })
  @IsString()
  @IsNotEmpty()
  cardHolder!: string;

  @ApiProperty({
    example: '12',
    description: 'Mês de validade do cartão.',
  })
  @IsString()
  @Length(2, 2)
  expiryMonth!: string;

  @ApiProperty({
    example: '2030',
    description: 'Ano de validade do cartão.',
  })
  @IsString()
  @Length(4, 4)
  expiryYear!: string;

  @ApiProperty({
    example: '123',
    description: 'Código de segurança do cartão.',
    writeOnly: true,
  })
  @IsString()
  @Length(3, 4)
  cvv!: string;

  @ApiProperty({
    example: 5,
    minimum: 1,
    maximum: 21,
    description: 'Quantidade de parcelas.',
  })
  @IsInt()
  @Min(1)
  installments!: number;

  @ApiProperty({
    example: 3.89,
    minimum: 0,
    maximum: 100,
    description:
      'Taxa percentual correspondente à bandeira e quantidade de parcelas.',
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  feePercent!: number;
}
