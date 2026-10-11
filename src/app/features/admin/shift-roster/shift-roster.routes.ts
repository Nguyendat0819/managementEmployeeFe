import { Routes } from '@angular/router';
import { RosterManagementComponent } from './page/roster-management/roster-management.component';

export const shiftRosterAdminRoutes: Routes = [
  {
    path: '',
    title: 'Phân ca làm việc',
    component: RosterManagementComponent,
  },
];
