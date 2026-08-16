import { IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreateWithdrawalDto {
  @IsPositive()
  amount!: number;

  @IsString()
  @IsNotEmpty()
  pixKey!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  externalReference!: string;

  @IsString()
  @IsNotEmpty()
  document!: string;
}
