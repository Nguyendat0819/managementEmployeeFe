import { Component } from '@angular/core';
import { AdminPayrollRunComponent } from '../../components/payroll-run/admin-payroll-run.component';

@Component({
  selector: 'app-payroll-run-page',
  standalone: true,
  imports: [AdminPayrollRunComponent],
  templateUrl: './payroll-run.component.html',
  styleUrl: './payroll-run.component.css',
})
export class PayrollRunComponent {}
