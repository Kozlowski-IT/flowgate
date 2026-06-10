import { RequestStatus } from '../value-objects/request-status';

export type AuditAction =
  | 'created'
  | 'submitted'
  | 'review_started'
  | 'approved'
  | 'rejected'
  | 'changes_requested';

/** immutable, append-only audit entry — who did what, when, from → to */
export class RequestEvent {
  constructor(
    public readonly id: string,
    public readonly requestId: string,
    public readonly actorId: string,
    public readonly action: AuditAction,
    public readonly fromStatus: RequestStatus | null,
    public readonly toStatus: RequestStatus,
    public readonly comment: string | null,
    public readonly createdAt: Date,
  ) {}
}
