import { Injectable } from '@angular/core';
import { ADMIN_ATTENDANCE_RECORDS } from '../data/admin-attendance.mock';

@Injectable({ providedIn: 'root' })
export class AdminAttendanceService {
  readonly records = ADMIN_ATTENDANCE_RECORDS.map((record) => ({ ...record }));
}
