import { RequestStatus } from '../value-objects/request-status';

/** domain event — emitted on every status change; phase 5 realtime hooks in here */
export class RequestStatusChangedEvent {
  static readonly eventName = 'request.status-changed';

  constructor(
    public readonly requestId: string,
    public readonly from: RequestStatus | null,
    public readonly to: RequestStatus,
    public readonly actorId: string,
  ) {}
}
