import { Routes } from '@angular/router';
import { HolidayManagementComponent } from './page/holiday-management/holiday-management.component';

export const holidayAdminRoutes: Routes = [
  {
    path: '',
    title: 'Ngày nghỉ lễ',
    component: HolidayManagementComponent,
  },
];
