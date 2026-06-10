import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManageRequestsUseCase } from './application/manage-requests.use-case';
import { RequestsController } from './application/requests.controller';
import { ReviewRequestUseCase } from './application/review-request.use-case';
import { REQUEST_EVENT_REPOSITORY } from './domain/repositories/request-event.repository';
import { REQUEST_REPOSITORY } from './domain/repositories/request.repository';
import { RequestEventOrmEntity } from './infrastructure/persistence/request-event.orm-entity';
import { RequestOrmEntity } from './infrastructure/persistence/request.orm-entity';
import { TypeormRequestEventRepository } from './infrastructure/repositories/typeorm-request-event.repository';
import { TypeormRequestRepository } from './infrastructure/repositories/typeorm-request.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([RequestOrmEntity, RequestEventOrmEntity]),
  ],
  controllers: [RequestsController],
  providers: [
    { provide: REQUEST_REPOSITORY, useClass: TypeormRequestRepository },
    {
      provide: REQUEST_EVENT_REPOSITORY,
      useClass: TypeormRequestEventRepository,
    },
    ManageRequestsUseCase,
    ReviewRequestUseCase,
  ],
  exports: [REQUEST_REPOSITORY],
})
export class RequestsModule {}
