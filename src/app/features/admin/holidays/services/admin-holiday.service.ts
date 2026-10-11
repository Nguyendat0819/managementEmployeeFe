import { Injectable } from '@angular/core';
import { ADMIN_HOLIDAYS } from '../data/admin-holiday.mock';

@Injectable({ providedIn: 'root' })
export class AdminHolidayService {
  readonly holidays = ADMIN_HOLIDAYS.map((holiday) => ({ ...holiday }));
}
