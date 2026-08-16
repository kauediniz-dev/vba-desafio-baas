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
  @IsPositive()
  amount!: number;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  externalReference!: string;

  @IsString()
  @Length(13, 19)
  cardNumber!: string;

  @IsString()
  @IsNotEmpty()
  cardHolder!: string;

  @IsString()
  @Length(2, 2)
  expiryMonth!: string;

  @IsString()
  @Length(4, 4)
  expiryYear!: string;

  @IsString()
  @Length(3, 4)
  cvv!: string;

  @IsInt()
  @Min(1)
  installments!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  feePercent!: number;
}
