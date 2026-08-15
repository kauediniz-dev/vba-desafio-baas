import { IsNotEmpty, IsPositive, IsString, Length } from 'class-validator';

export class CreatePixCheckoutDto {
  @IsPositive()
  amount!: number;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @Length(11, 14)
  payerDocument!: string;

  @IsString()
  @IsNotEmpty()
  externalReference!: string;
}
