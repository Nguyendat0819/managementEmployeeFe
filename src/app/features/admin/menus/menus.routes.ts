import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { AuthService } from '@platform/shared';
import { MenuManagementComponent } from './menu-management.component';

const adminOnly = () => {
  const auth = inject(AuthService);
  return auth.currentUser()?.roles?.includes('ADMIN')
    ? true
    : inject(Router).createUrlTree(['/user/dashboard']);
};

export const menuManagementRoutes: Routes = [
  {
    path: '',
    title: 'Quản lý menu',
    component: MenuManagementComponent,
    canActivate: [adminOnly],
  },
];
