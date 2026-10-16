import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'catalogue',
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
  },
  {
    path: 'catalogue',
    loadComponent: () => import('./features/catalogue/liste-articles').then((m) => m.ListeArticles),
  },
  {
    path: 'articles/nouveau',
    canActivate: [authGuard, roleGuard('LOUEUR', 'ADMIN')],
    loadComponent: () =>
      import('./features/catalogue/formulaire-article').then((m) => m.FormulaireArticle),
  },
  {
    path: 'articles/:id',
    loadComponent: () =>
      import('./features/catalogue/detail-article').then((m) => m.DetailArticle),
  },
  {
    path: 'articles/:id/modifier',
    canActivate: [authGuard, roleGuard('LOUEUR', 'ADMIN')],
    loadComponent: () =>
      import('./features/catalogue/formulaire-article').then((m) => m.FormulaireArticle),
  },
  {
    path: 'reservations',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/reservations/liste-reservations').then((m) => m.ListeReservations),
  },
  {
    path: 'reservations/nouvelle',
    canActivate: [authGuard, roleGuard('CLIENT', 'ADMIN')],
    loadComponent: () =>
      import('./features/reservations/formulaire-reservation').then((m) => m.FormulaireReservation),
  },
  {
    path: 'reservations/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/reservations/detail-reservation').then((m) => m.DetailReservation),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard('ADMIN')],
    loadComponent: () => import('./features/admin/admin').then((m) => m.Admin),
  },
  {
    path: '**',
    redirectTo: 'catalogue',
  },
];
