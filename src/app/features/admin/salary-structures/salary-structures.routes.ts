import { Routes } from '@angular/router';
import { SalaryStructureComponent } from './page/salary-structure/salary-structure.component';

export const salaryStructureAdminRoutes: Routes = [
  {
    path: '',
    title: 'Thang bảng lương',
    component: SalaryStructureComponent,
  },
];
