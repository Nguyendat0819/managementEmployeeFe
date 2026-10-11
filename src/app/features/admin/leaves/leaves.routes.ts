import { Routes } from '@angular/router';
import { LeaveApprovalComponent } from './page/leave-approval/leave-approval.component';

export const leaveAdminRoutes: Routes = [
  {
    path: '',
    title: 'Duyệt đơn nghỉ phép',
    component: LeaveApprovalComponent,
  },
];
