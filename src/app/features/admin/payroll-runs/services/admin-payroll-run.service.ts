import { Injectable } from '@angular/core';
import { ADMIN_PAYROLL_RUNS } from '../data/admin-payroll-run.mock';

@Injectable({ providedIn: 'root' })
export class AdminPayrollRunService {
  readonly runs = ADMIN_PAYROLL_RUNS.map((run) => ({ ...run }));
}
