import { Routes } from '@angular/router';
import { PayrollRunComponent } from './page/payroll-run/payroll-run.component';

export const payrollRunAdminRoutes: Routes = [
  {
    path: ':runId',
    title: 'Chi tiết kỳ lương',
    component: PayrollRunComponent,
  },
  {
    path: '',
    title: 'Kỳ tính lương',
    component: PayrollRunComponent,
  },
];
