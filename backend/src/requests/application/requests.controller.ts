import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import type { AuthUser } from '../../shared/types/auth-user';
import { Role } from '../../users/domain/value-objects/role';
import { Request } from '../domain/entities/request';
import { RequestEvent } from '../domain/entities/request-event';
import { CreateRequestDto } from './dto/create-request.dto';
import { DecisionDto } from './dto/decision.dto';
import { ManageRequestsUseCase } from './manage-requests.use-case';
import { ReviewRequestUseCase } from './review-request.use-case';

@Controller('requests')
export class RequestsController {
  constructor(
    private readonly useCase: ManageRequestsUseCase,
    private readonly reviewUseCase: ReviewRequestUseCase,
  ) {}

  @Get()
  list(@CurrentUser() user: AuthUser): Promise<Request[]> {
    return this.useCase.list(user);
  }

  @Get(':id')
  get(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Request> {
    return this.useCase.get(user, id);
  }

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateRequestDto,
  ): Promise<Request> {
    return this.useCase.create(user, dto);
  }

  @Put(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateRequestDto,
  ): Promise<Request> {
    return this.useCase.update(user, id, dto);
  }

  @Post(':id/submit')
  @HttpCode(200)
  submit(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Request> {
    return this.useCase.submit(user, id);
  }

  @Get(':id/events')
  events(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<RequestEvent[]> {
    return this.useCase.eventsFor(user, id);
  }

  @Post(':id/start-review')
  @HttpCode(200)
  @Roles(Role.Reviewer, Role.Admin)
  startReview(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Request> {
    return this.reviewUseCase.startReview(user, id);
  }

  @Post(':id/decision')
  @HttpCode(200)
  @Roles(Role.Reviewer, Role.Admin)
  decide(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DecisionDto,
  ): Promise<Request> {
    return this.reviewUseCase.decide(user, id, dto);
  }
}
