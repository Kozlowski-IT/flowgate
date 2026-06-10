import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { REQUEST_REPOSITORY } from './domain/repositories/request.repository';
import { RequestOrmEntity } from './infrastructure/persistence/request.orm-entity';
import { TypeormRequestRepository } from './infrastructure/repositories/typeorm-request.repository';

@Module({
  imports: [TypeOrmModule.forFeature([RequestOrmEntity])],
  providers: [
    { provide: REQUEST_REPOSITORY, useClass: TypeormRequestRepository },
  ],
  exports: [REQUEST_REPOSITORY],
})
export class RequestsModule {}
