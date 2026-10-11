import { Routes } from '@angular/router';
import { UserManagementComponent } from './page/user-management/user-management.component';

export const userAdminRoutes: Routes = [
  {
    path: '',
    title: 'Tài khoản người dùng',
    component: UserManagementComponent,
  },
];
