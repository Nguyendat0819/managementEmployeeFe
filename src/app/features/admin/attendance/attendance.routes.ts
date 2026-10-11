import { Routes } from '@angular/router';
import { AttendanceManagementComponent } from './page/attendance-management/attendance-management.component';

export const attendanceAdminRoutes: Routes = [
  {
    path: '',
    title: 'Quản lý chấm công',
    component: AttendanceManagementComponent,
  },
];
