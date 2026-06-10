import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request, RequestPayload } from '../../domain/entities/request';
import { RequestRepository } from '../../domain/repositories/request.repository';
import { RequestOrmEntity } from '../persistence/request.orm-entity';

@Injectable()
export class TypeormRequestRepository implements RequestRepository {
  constructor(
    @InjectRepository(RequestOrmEntity)
    private readonly repo: Repository<RequestOrmEntity>,
  ) {}

  async findById(id: string): Promise<Request | null> {
    return this.toDomain(await this.repo.findOneBy({ id }));
  }

  async findByRequester(requesterId: string): Promise<Request[]> {
    const rows = await this.repo.find({
      where: { requesterId },
      order: { updatedAt: 'DESC' },
    });
    return rows.map((row) => this.toDomain(row)!);
  }

  async findAll(): Promise<Request[]> {
    const rows = await this.repo.find({ order: { updatedAt: 'DESC' } });
    return rows.map((row) => this.toDomain(row)!);
  }

  async create(input: {
    title: string;
    payload: RequestPayload;
    requesterId: string;
  }): Promise<Request> {
    const row = await this.repo.save(this.repo.create(input));
    return this.toDomain(row)!;
  }

  async save(request: Request): Promise<void> {
    await this.repo.update(request.id, {
      title: request.title,
      payload: request.payload,
      status: request.status,
      reviewerId: request.reviewerId,
    });
  }

  private toDomain(row: RequestOrmEntity | null): Request | null {
    if (!row) return null;
    return new Request(
      row.id,
      row.title,
      row.payload,
      row.status,
      row.requesterId,
      row.reviewerId,
      row.createdAt,
      row.updatedAt,
    );
  }
}
