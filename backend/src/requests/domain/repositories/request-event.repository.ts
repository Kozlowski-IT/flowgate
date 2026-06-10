import { AuditAction, RequestEvent } from '../entities/request-event';
import { RequestStatus } from '../value-objects/request-status';

export const REQUEST_EVENT_REPOSITORY = Symbol('REQUEST_EVENT_REPOSITORY');

export interface AppendEventInput {
  requestId: string;
  actorId: string;
  action: AuditAction;
  fromStatus: RequestStatus | null;
  toStatus: RequestStatus;
  comment?: string | null;
}

/** append-only by design — no update, no delete */
export interface RequestEventRepository {
  append(input: AppendEventInput): Promise<RequestEvent>;
  listByRequest(requestId: string): Promise<RequestEvent[]>;
}
