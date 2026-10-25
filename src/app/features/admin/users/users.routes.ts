import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@platform/shared';
import { UserManagementComponent } from './page/user-management/user-management.component';

const adminOnly = () => {
  const auth = inject(AuthService);
  return auth.currentUser()?.roles?.includes('ADMIN')
    ? true
    : inject(Router).createUrlTree(['/user/dashboard']);
};

export const userAdminRoutes: Routes = [
  {
    path: '',
    title: 'Tài khoản người dùng',
    component: UserManagementComponent,
    canActivate: [adminOnly],
  },
];
