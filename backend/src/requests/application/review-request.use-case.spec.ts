import { EventEmitter2 } from '@nestjs/event-emitter';
import { Request, RequestPayload } from '../domain/entities/request';
import { InvalidStatusTransition, NotAssignedReviewer } from '../domain/errors';
import { RequestEvent } from '../domain/entities/request-event';
import {
  AppendEventInput,
  RequestEventRepository,
} from '../domain/repositories/request-event.repository';
import { RequestRepository } from '../domain/repositories/request.repository';
import { RequestStatus } from '../domain/value-objects/request-status';
import { Role } from '../../users/domain/value-objects/role';
import { ReviewRequestUseCase } from './review-request.use-case';

const payload: RequestPayload = {
  category: 'other',
  description: 'Zehn Zeichen mindestens',
};

const req = (status: RequestStatus, reviewerId: string | null = null) =>
  new Request(
    'r1',
    'Test',
    payload,
    status,
    'owner1',
    reviewerId,
    new Date(),
    new Date(),
  );

class FakeRequestRepo implements RequestRepository {
  constructor(public row: Request | null) {}
  findById = async () => this.row;
  findByRequester = async () => [];
  findAll = async () => [];
  create = async () => this.row!;
  save = jest.fn(async () => undefined);
}

class FakeEventRepo implements RequestEventRepository {
  public appended: AppendEventInput[] = [];
  append = async (input: AppendEventInput) => {
    this.appended.push(input);
    return new RequestEvent(
      `e${this.appended.length}`,
      input.requestId,
      input.actorId,
      input.action,
      input.fromStatus,
      input.toStatus,
      input.comment ?? null,
      new Date(),
    );
  };
  listByRequest = async () => [];
}

const emitter = { emit: jest.fn() } as unknown as EventEmitter2;
const reviewer = { sub: 'rev1', email: 'v@x.de', role: Role.Reviewer };
const otherReviewer = { sub: 'rev2', email: 'w@x.de', role: Role.Reviewer };
const admin = { sub: 'adm1', email: 'a@x.de', role: Role.Admin };

const useCaseWith = (request: Request) => {
  const events = new FakeEventRepo();
  const repo = new FakeRequestRepo(request);
  return {
    useCase: new ReviewRequestUseCase(repo, events, emitter),
    events,
    repo,
  };
};

describe('ReviewRequestUseCase', () => {
  beforeEach(() => jest.clearAllMocks());

  it('start review: submitted → in_review and assigns the reviewer', async () => {
    const { useCase, events } = useCaseWith(req(RequestStatus.Submitted));
    const result = await useCase.startReview(reviewer, 'r1');
    expect(result.status).toBe(RequestStatus.InReview);
    expect(result.reviewerId).toBe('rev1');
    expect(events.appended[0]).toMatchObject({
      action: 'review_started',
      fromStatus: RequestStatus.Submitted,
      toStatus: RequestStatus.InReview,
    });
  });

  it('start review on a draft is an invalid transition', async () => {
    const { useCase } = useCaseWith(req(RequestStatus.Draft));
    await expect(useCase.startReview(reviewer, 'r1')).rejects.toBeInstanceOf(
      InvalidStatusTransition,
    );
  });

  it('approve: in_review → approved by the assigned reviewer', async () => {
    const { useCase, events } = useCaseWith(
      req(RequestStatus.InReview, 'rev1'),
    );
    const result = await useCase.decide(reviewer, 'r1', {
      decision: 'approved',
    });
    expect(result.status).toBe(RequestStatus.Approved);
    expect(events.appended[0].action).toBe('approved');
  });

  it('reject stores the mandatory comment in the audit entry', async () => {
    const { useCase, events } = useCaseWith(
      req(RequestStatus.InReview, 'rev1'),
    );
    await useCase.decide(reviewer, 'r1', {
      decision: 'rejected',
      comment: 'Budget für dieses Quartal erschöpft.',
    });
    expect(events.appended[0]).toMatchObject({
      action: 'rejected',
      comment: 'Budget für dieses Quartal erschöpft.',
    });
  });

  it('a different reviewer must not decide', async () => {
    const { useCase } = useCaseWith(req(RequestStatus.InReview, 'rev1'));
    await expect(
      useCase.decide(otherReviewer, 'r1', { decision: 'approved' }),
    ).rejects.toBeInstanceOf(NotAssignedReviewer);
  });

  it('an admin may always decide', async () => {
    const { useCase } = useCaseWith(req(RequestStatus.InReview, 'rev1'));
    const result = await useCase.decide(admin, 'r1', { decision: 'approved' });
    expect(result.status).toBe(RequestStatus.Approved);
  });

  it('deciding a submitted (not yet in review) request is invalid', async () => {
    const { useCase } = useCaseWith(req(RequestStatus.Submitted, 'rev1'));
    await expect(
      useCase.decide(reviewer, 'r1', { decision: 'approved' }),
    ).rejects.toBeInstanceOf(InvalidStatusTransition);
  });

  it('approving an already approved request is invalid', async () => {
    const { useCase } = useCaseWith(req(RequestStatus.Approved, 'rev1'));
    await expect(
      useCase.decide(reviewer, 'r1', { decision: 'approved' }),
    ).rejects.toBeInstanceOf(InvalidStatusTransition);
  });

  it('emits a domain event on every status change', async () => {
    const { useCase } = useCaseWith(req(RequestStatus.Submitted));
    await useCase.startReview(reviewer, 'r1');
    expect(emitter.emit).toHaveBeenCalledWith(
      'request.status-changed',
      expect.objectContaining({
        requestId: 'r1',
        from: RequestStatus.Submitted,
        to: RequestStatus.InReview,
      }),
    );
  });
});
