import { Injectable } from '@angular/core';
import { ADMIN_CONTRACTS, ADMIN_EMPLOYEES } from '../data/admin-employee.mock';

@Injectable({ providedIn: 'root' })
export class AdminEmployeeService {
  readonly employees = ADMIN_EMPLOYEES.map((employee) => ({ ...employee }));
  readonly contracts = ADMIN_CONTRACTS.map((contract) => ({ ...contract }));
}
