import { Injectable } from '@angular/core';
import { ADMIN_SALARY_STRUCTURES } from '../data/admin-salary-structure.mock';

@Injectable({ providedIn: 'root' })
export class AdminSalaryStructureService {
  readonly structures = ADMIN_SALARY_STRUCTURES.map((structure) => ({ ...structure }));
}
