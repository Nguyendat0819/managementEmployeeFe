import { Routes } from '@angular/router';
import { ContractManagementComponent } from './page/contract-management/contract-management.component';
import { EmployeeManagementComponent } from './page/employee-management/employee-management.component';

export const employeeAdminRoutes: Routes = [
  {
    path: 'employees',
    title: 'Danh sách nhân viên',
    component: EmployeeManagementComponent,
  },
  {
    path: 'contracts',
    title: 'Hợp đồng lao động',
    component: ContractManagementComponent,
  },
];
