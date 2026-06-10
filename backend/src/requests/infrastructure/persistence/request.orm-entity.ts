import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { RequestPayload } from '../../domain/entities/request';
import { RequestStatus } from '../../domain/value-objects/request-status';

@Entity('requests')
export class RequestOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'jsonb' })
  payload!: RequestPayload;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    enumName: 'request_status',
    default: RequestStatus.Draft,
  })
  status!: RequestStatus;

  @Index()
  @Column({ name: 'requester_id', type: 'uuid' })
  requesterId!: string;

  @Column({ name: 'reviewer_id', type: 'uuid', nullable: true })
  reviewerId!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
