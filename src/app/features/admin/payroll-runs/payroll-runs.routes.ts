import { Routes } from '@angular/router';
import { PayrollRunComponent } from './page/payroll-run/payroll-run.component';

export const payrollRunAdminRoutes: Routes = [
  {
    path: '',
    title: 'Kỳ tính lương',
    component: PayrollRunComponent,
  },
];
