import { Injectable } from '@angular/core';
import { ADMIN_SHIFTS } from '../data/admin-shift.mock';

@Injectable({ providedIn: 'root' })
export class AdminShiftService {
  readonly shifts = ADMIN_SHIFTS.map((shift) => ({ ...shift, dayOfWeek: [...shift.dayOfWeek] }));
}
