import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'teste@local.dev',
    description: 'E-mail do usuário cadastrado na aplicação BaaS.',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: '12345678901',
    description: 'Documento utilizado para autenticação no gateway.',
  })
  @IsString()
  @IsNotEmpty()
  document!: string;

  @ApiProperty({
    example: 'senha-do-gateway',
    description: 'Senha utilizada para autenticação no gateway.',
    writeOnly: true,
  })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
