import { Routes } from '@angular/router';
import { RolePermissionManagementComponent } from './page/role-permission-management/role-permission-management.component';

export const rolesPermissionsAdminRoutes: Routes = [
  {
    path: '',
    title: 'Vai trò & Phân quyền',
    component: RolePermissionManagementComponent,
  },
];
