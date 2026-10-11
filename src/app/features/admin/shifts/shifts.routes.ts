import { Routes } from '@angular/router';
import { ShiftManagementComponent } from './page/shift-management/shift-management.component';

export const shiftAdminRoutes: Routes = [
  {
    path: '',
    title: 'Ca làm việc',
    component: ShiftManagementComponent,
  },
];
