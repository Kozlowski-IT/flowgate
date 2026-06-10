import { Request, RequestPayload } from '../entities/request';

export const REQUEST_REPOSITORY = Symbol('REQUEST_REPOSITORY');

export interface RequestRepository {
  findById(id: string): Promise<Request | null>;
  findByRequester(requesterId: string): Promise<Request[]>;
  findAll(): Promise<Request[]>;
  create(input: {
    title: string;
    payload: RequestPayload;
    requesterId: string;
  }): Promise<Request>;
  save(request: Request): Promise<void>;
}
