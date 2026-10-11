import { Component } from '@angular/core';
import { AdminEmployeeListComponent } from '../../components/employee-list/admin-employee-list.component';

@Component({
  selector: 'app-employee-management',
  standalone: true,
  imports: [AdminEmployeeListComponent],
  templateUrl: './employee-management.component.html',
  styleUrl: './employee-management.component.css',
})
export class EmployeeManagementComponent {}
