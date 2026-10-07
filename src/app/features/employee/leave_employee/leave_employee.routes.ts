import { Routes } from '@angular/router';
import { LeaveEmployeeComponent } from './components/leave_employee.component';

export const leaveEmployeeRoutes: Routes = [
  {
    path: '',
    title: 'Nghỉ phép cá nhân',
    component: LeaveEmployeeComponent,
  },
];
