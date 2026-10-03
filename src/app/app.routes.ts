import { Routes } from '@angular/router';
import { authGuard } from '@core';
import { LoginComponent } from './features/auth/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Đăng nhập',
    component: LoginComponent,
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'Trang chủ',
        component: DashboardComponent,
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
