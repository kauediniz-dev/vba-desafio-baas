import { Controller, Get, Query } from '@nestjs/common';

import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('by-email')
  async findByEmail(@Query('email') email: string): Promise<User> {
    return await this.usersService.findByEmail(email);
  }
}
