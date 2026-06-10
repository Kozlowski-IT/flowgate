import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login').then((m) => m.Login),
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/requests/request-list/request-list').then(
            (m) => m.RequestList,
          ),
      },
      {
        path: 'requests/new',
        loadComponent: () =>
          import('./features/requests/request-wizard/request-wizard').then(
            (m) => m.RequestWizard,
          ),
      },
      {
        path: 'requests/:id/edit',
        loadComponent: () =>
          import('./features/requests/request-wizard/request-wizard').then(
            (m) => m.RequestWizard,
          ),
      },
      {
        path: 'requests/:id',
        loadComponent: () =>
          import('./features/requests/request-detail/request-detail').then(
            (m) => m.RequestDetail,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
