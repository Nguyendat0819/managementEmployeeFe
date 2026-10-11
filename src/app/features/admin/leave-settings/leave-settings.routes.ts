import { Routes } from '@angular/router';
import { LeaveSettingsComponent } from './page/leave-settings/leave-settings.component';

export const leaveSettingsAdminRoutes: Routes = [
  {
    path: '',
    title: 'Cấu hình nghỉ phép',
    component: LeaveSettingsComponent,
  },
];
