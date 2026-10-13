import { Routes } from '@angular/router';
import { PositionManagementComponent } from './page/position-management/position-management.component';

export const positionAdminRoutes: Routes = [
  {
    path: '',
    title: 'Danh mục chức vụ',
    component: PositionManagementComponent,
  },
];
