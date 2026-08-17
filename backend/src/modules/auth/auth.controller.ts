import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Autenticar usuário',
    description:
      'Autentica o usuário local, realiza login no gateway e retorna um JWT da aplicação BaaS.',
  })
  @ApiOkResponse({
    description: 'Usuário autenticado com sucesso.',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIs...',
        user: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'teste@local.dev',
          name: 'Usuário Teste',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Dados enviados são inválidos.',
  })
  @ApiUnauthorizedResponse({
    description: 'Credenciais inválidas.',
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
