import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { WorkScheduleApiService } from '@core/services/work-schedule-api.service';
import { AdminShift } from '../models/admin-shift.model';

@Injectable({ providedIn: 'root' })
export class AdminShiftService {
  constructor(private readonly api: WorkScheduleApiService) {}

  getShifts(): Observable<AdminShift[]> {
    return this.api.getShifts().pipe(map(({ data }) => data.map((shift) => ({
      ...shift,
      dayLabel: this.dayLabelOf(shift.dayOfWeek),
      status: shift.active ? 'Đang hoạt động' as const : 'Tạm ngưng' as const,
    }))));
  }

  saveShift(shift: Omit<AdminShift, 'id' | 'dayLabel' | 'assignedCount'> & { id?: number }): Observable<AdminShift> {
    const request = {
      shiftName: shift.shiftName,
      startTime: shift.startTime,
      endTime: shift.endTime,
      dayOfWeek: shift.dayOfWeek,
      active: shift.status === 'Đang hoạt động',
    };
    const save$ = shift.id
      ? this.api.updateShift(shift.id, request)
      : this.api.createShift(request);
    return save$.pipe(map(({ data }) => ({
      ...data,
      dayLabel: this.dayLabelOf(data.dayOfWeek),
      status: (data.active ? 'Đang hoạt động' : 'Tạm ngưng') as AdminShift['status'],
    })));
  }

  deleteShift(id: number): Observable<void> {
    return this.api.deleteShift(id).pipe(map(() => undefined));
  }

  private dayLabelOf(days: string[]): string {
    if (days.length === 7) return 'Tất cả các ngày';
    if (days.join(',') === 'T2,T3,T4,T5,T6') return 'Thứ Hai - Thứ Sáu';
    if (days.join(',') === 'T2,T3,T4,T5,T6,T7') return 'Thứ Hai - Thứ Bảy';
    if (days.join(',') === 'T7,CN') return 'Thứ Bảy - Chủ Nhật';
    return days.join(' · ');
  }
}
