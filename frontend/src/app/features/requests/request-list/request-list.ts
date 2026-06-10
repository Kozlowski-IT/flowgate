import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import {
  CATEGORY_LABELS,
  STATUS_LABELS,
} from '../../../core/requests/request.model';
import { RequestsService } from '../../../core/requests/requests.service';

@Component({
  selector: 'app-request-list',
  imports: [DatePipe, RouterLink],
  templateUrl: './request-list.html',
  styleUrl: './request-list.scss',
})
export class RequestList implements OnInit {
  protected readonly auth = inject(AuthService);
  protected readonly requestsService = inject(RequestsService);
  private readonly router = inject(Router);

  protected readonly categoryLabels = CATEGORY_LABELS;
  protected readonly statusLabels = STATUS_LABELS;

  ngOnInit(): void {
    this.requestsService.reload();
  }

  protected open(id: string): void {
    void this.router.navigate(['/requests', id]);
  }

  protected logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }
}
