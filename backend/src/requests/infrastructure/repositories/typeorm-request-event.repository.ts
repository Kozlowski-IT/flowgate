import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestEvent } from '../../domain/entities/request-event';
import {
  AppendEventInput,
  RequestEventRepository,
} from '../../domain/repositories/request-event.repository';
import { RequestEventOrmEntity } from '../persistence/request-event.orm-entity';

@Injectable()
export class TypeormRequestEventRepository implements RequestEventRepository {
  constructor(
    @InjectRepository(RequestEventOrmEntity)
    private readonly repo: Repository<RequestEventOrmEntity>,
  ) {}

  async append(input: AppendEventInput): Promise<RequestEvent> {
    const row = await this.repo.save(
      this.repo.create({ ...input, comment: input.comment ?? null }),
    );
    return this.toDomain(row);
  }

  async listByRequest(requestId: string): Promise<RequestEvent[]> {
    const rows = await this.repo.find({
      where: { requestId },
      order: { createdAt: 'ASC' },
    });
    return rows.map((row) => this.toDomain(row));
  }

  private toDomain(row: RequestEventOrmEntity): RequestEvent {
    return new RequestEvent(
      row.id,
      row.requestId,
      row.actorId,
      row.action,
      row.fromStatus,
      row.toStatus,
      row.comment,
      row.createdAt,
    );
  }
}
