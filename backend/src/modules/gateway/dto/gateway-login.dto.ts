import { IsNotEmpty, IsString } from 'class-validator';

export class GatewayLoginDto {
  @IsString()
  @IsNotEmpty()
  document!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
