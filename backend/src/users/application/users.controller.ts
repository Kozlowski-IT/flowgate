import { Controller, Get, Inject } from '@nestjs/common';
import { Roles } from '../../shared/decorators/roles.decorator';
import { USER_REPOSITORY } from '../domain/repositories/user.repository';
import type { UserRepository } from '../domain/repositories/user.repository';
import { Role } from '../domain/value-objects/role';

@Controller('users')
export class UsersController {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
  ) {}

  @Get()
  @Roles(Role.Admin)
  async findAll(): Promise<Array<{ id: string; email: string; role: Role }>> {
    const all = await this.users.findAll();
    return all.map(({ id, email, role }) => ({ id, email, role })); // never expose passwordHash
  }
}
