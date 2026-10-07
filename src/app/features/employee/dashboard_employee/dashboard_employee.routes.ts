import { Routes } from '@angular/router';
import { DashboardEmployeeComponent } from './components/dashboard_employee.component';

export const dashboardEmployeeRoutes: Routes = [
  {
    path: '',
    title: 'Trang chủ',
    component: DashboardEmployeeComponent,
  },
];
