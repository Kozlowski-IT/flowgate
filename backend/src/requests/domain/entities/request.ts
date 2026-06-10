import {
  InvalidStatusTransition,
  NotAssignedReviewer,
  NotRequestOwner,
  RequestNotEditable,
} from '../errors';
import { RequestStatus } from '../value-objects/request-status';

export interface RequestPayload {
  category: 'purchase' | 'travel' | 'access' | 'other';
  description: string;
  amountEur?: number;
  neededBy?: string; // ISO date
}

export interface StatusChange {
  from: RequestStatus;
  to: RequestStatus;
}

export type Decision =
  | RequestStatus.Approved
  | RequestStatus.Rejected
  | RequestStatus.ChangesRequested;

/** which status may move where — the single source of truth of the state machine */
const TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  [RequestStatus.Draft]: [RequestStatus.Submitted],
  [RequestStatus.Submitted]: [RequestStatus.InReview],
  [RequestStatus.InReview]: [
    RequestStatus.Approved,
    RequestStatus.Rejected,
    RequestStatus.ChangesRequested,
  ],
  [RequestStatus.ChangesRequested]: [RequestStatus.Submitted],
  [RequestStatus.Approved]: [],
  [RequestStatus.Rejected]: [],
};

const EDITABLE: RequestStatus[] = [
  RequestStatus.Draft,
  RequestStatus.ChangesRequested,
];

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

  // TODO(Pascal): Das Herzstück der Status-Maschine — ca. 6 Zeilen:
  //   1) Schaue in der TRANSITIONS-Tabelle nach, welche Ziel-Stati vom
  //      AKTUELLEN Status (this.status) aus erlaubt sind:
  //      const allowed = TRANSITIONS[this.status];
  //   2) Wenn `next` NICHT in `allowed` enthalten ist (.includes!):
  //      throw new InvalidStatusTransition();
  //   3) Sonst: merke dir den alten Status, setze this.status = next,
  //      und gib { from: <alter Status>, to: next } zurück.
  private transitionTo(next: RequestStatus): StatusChange {
    const from = this.status;
    this.status = next; // STUB: lässt aktuell ALLES durch — deine Aufgabe!
    return { from, to: next };
  }

  updateDraft(userId: string, title: string, payload: RequestPayload): void {
    this.assertOwnedBy(userId);
    if (!EDITABLE.includes(this.status)) throw new RequestNotEditable();
    this.title = title;
    this.payload = payload;
  }

  /** draft → submitted, and also changes_requested → submitted (resubmit) */
  submit(userId: string): StatusChange {
    this.assertOwnedBy(userId);
    return this.transitionTo(RequestStatus.Submitted);
  }

  /** submitted → in_review; whoever starts the review becomes the assigned reviewer */
  startReview(reviewerId: string): StatusChange {
    const change = this.transitionTo(RequestStatus.InReview);
    this.reviewerId = reviewerId;
    return change;
  }

  /** in_review → approved | rejected | changes_requested — assigned reviewer only */
  decide(
    reviewerId: string,
    decision: Decision,
    isAdmin = false,
  ): StatusChange {
    if (!isAdmin && this.reviewerId !== reviewerId) {
      throw new NotAssignedReviewer();
    }
    return this.transitionTo(decision);
  }
}
