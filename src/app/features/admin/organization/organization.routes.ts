import { Routes } from '@angular/router';
import { OrgUnitManagementComponent } from './page/org-unit-management/org-unit-management.component';

export const organizationRoutes: Routes = [
  {
    path: '',
    title: 'Quản lý cây đơn vị tổ chức',
    component: OrgUnitManagementComponent,
  },
];
