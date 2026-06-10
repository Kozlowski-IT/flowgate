import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  RequestEvent,
  RequestInput,
  ReviewDecision,
  WorkflowRequest,
} from './request.model';

@Injectable({ providedIn: 'root' })
export class RequestsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/requests`;

  readonly requests = signal<WorkflowRequest[]>([]);
  readonly loading = signal(false);

  reload(): void {
    this.loading.set(true);
    this.http.get<WorkflowRequest[]>(this.base).subscribe({
      next: (list) => {
        this.requests.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  get(id: string): Observable<WorkflowRequest> {
    return this.http.get<WorkflowRequest>(`${this.base}/${id}`);
  }

  create(input: RequestInput): Observable<WorkflowRequest> {
    return this.http.post<WorkflowRequest>(this.base, input);
  }

  update(id: string, input: RequestInput): Observable<WorkflowRequest> {
    return this.http.put<WorkflowRequest>(`${this.base}/${id}`, input);
  }

  submit(id: string): Observable<WorkflowRequest> {
    return this.http.post<WorkflowRequest>(`${this.base}/${id}/submit`, {});
  }

  events(id: string): Observable<RequestEvent[]> {
    return this.http.get<RequestEvent[]>(`${this.base}/${id}/events`);
  }

  startReview(id: string): Observable<WorkflowRequest> {
    return this.http.post<WorkflowRequest>(`${this.base}/${id}/start-review`, {});
  }

  decide(
    id: string,
    decision: ReviewDecision,
    comment?: string,
  ): Observable<WorkflowRequest> {
    return this.http.post<WorkflowRequest>(`${this.base}/${id}/decision`, {
      decision,
      ...(comment ? { comment } : {}),
    });
  }
}
