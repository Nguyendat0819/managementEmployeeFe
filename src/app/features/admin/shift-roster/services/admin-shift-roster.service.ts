import { Injectable } from '@angular/core';
import { ADMIN_SHIFT_ASSIGNMENTS } from '../data/admin-shift-assignment.mock';

@Injectable({ providedIn: 'root' })
export class AdminShiftRosterService {
  readonly assignments = ADMIN_SHIFT_ASSIGNMENTS.map((assignment) => ({ ...assignment }));
}
