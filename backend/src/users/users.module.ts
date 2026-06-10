import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './application/users.controller';
import { USER_REPOSITORY } from './domain/repositories/user.repository';
import { UserOrmEntity } from './infrastructure/persistence/user.orm-entity';
import { TypeormUserRepository } from './infrastructure/repositories/typeorm-user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity])],
  controllers: [UsersController],
  providers: [{ provide: USER_REPOSITORY, useClass: TypeormUserRepository }],
  exports: [USER_REPOSITORY],
})
export class UsersModule {}
