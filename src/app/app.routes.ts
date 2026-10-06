import { Routes } from '@angular/router';
import { authGuard } from '@core';
import { authRoutes } from './features/auth/auth.routes';
import { dashboardRoutes } from './features/dashboard/dashboard.routes';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  {
    path: 'login',
    children: authRoutes,
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        children: dashboardRoutes,
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
