import { NotRequestOwner, RequestNotEditable } from '../errors';
import { RequestStatus } from '../value-objects/request-status';

export interface RequestPayload {
  category: 'purchase' | 'travel' | 'access' | 'other';
  description: string;
  amountEur?: number;
  neededBy?: string; // ISO date
}

export class Request {
  constructor(
    public readonly id: string,
    public title: string,
    public payload: RequestPayload,
    public status: RequestStatus,
    public readonly requesterId: string,
    public reviewerId: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  private assertOwnedBy(userId: string): void {
    if (this.requesterId !== userId) throw new NotRequestOwner();
  }

  updateDraft(userId: string, title: string, payload: RequestPayload): void {
    this.assertOwnedBy(userId);
    if (this.status !== RequestStatus.Draft) throw new RequestNotEditable();
    this.title = title;
    this.payload = payload;
  }

  submit(userId: string): void {
    this.assertOwnedBy(userId);
    if (this.status !== RequestStatus.Draft) throw new RequestNotEditable();
    this.status = RequestStatus.Submitted;
  }
}
