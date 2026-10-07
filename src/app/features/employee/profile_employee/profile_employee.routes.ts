import { Routes } from '@angular/router';
import { ProfileEmployeeComponent } from './components/profile_employee.component';

export const profileEmployeeRoutes: Routes = [
  {
    path: '',
    title: 'Hồ sơ & Hợp đồng',
    component: ProfileEmployeeComponent,
  },
];
