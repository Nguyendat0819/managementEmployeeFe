import { Routes } from '@angular/router';
import { PayslipEmployeeComponent } from './components/payslip_employee.component';

export const payslipEmployeeRoutes: Routes = [
  {
    path: '',
    title: 'Phiếu lương điện tử',
    component: PayslipEmployeeComponent,
  },
];
