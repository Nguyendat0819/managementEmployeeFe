import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { WorkScheduleApiService } from '@core/services/work-schedule-api.service';
import { ShiftAssignmentRequestDto } from '@core/models/work-schedule.model';
import { AdminShiftAssignment } from '../models/admin-shift-assignment.model';

@Injectable({ providedIn: 'root' })
export class AdminShiftRosterService {
  constructor(private readonly api: WorkScheduleApiService) {}

  getAssignments(): Observable<AdminShiftAssignment[]> {
    return this.api.getAssignments().pipe(map(({ data }) => data.map((assignment) => this.toViewModel(assignment))));
  }

  saveAssignment(id: number | undefined, request: ShiftAssignmentRequestDto): Observable<AdminShiftAssignment> {
    const save$ = id
      ? this.api.updateAssignment(id, request)
      : this.api.createAssignment(request);
    return save$.pipe(map(({ data }) => this.toViewModel(data)));
  }

  deleteAssignment(id: number): Observable<void> {
    return this.api.deleteAssignment(id).pipe(map(() => undefined));
  }

  private toViewModel(assignment: {
    id: number;
    employeeCode: string;
    shiftId: number;
    shiftName: string | null;
    startTime: string | null;
    endTime: string | null;
    dayOfWeek: string[] | null;
    effectiveDate: string;
    endDate: string | null;
  }): AdminShiftAssignment {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const status = assignment.effectiveDate > today
      ? 'Sắp áp dụng'
      : assignment.endDate && assignment.endDate < today ? 'Đã kết thúc' : 'Đang áp dụng';
    return {
      id: assignment.id,
      employeeCode: assignment.employeeCode,
      shiftId: assignment.shiftId,
      shiftName: assignment.shiftName ?? 'Ca không xác định',
      shiftTime: assignment.startTime && assignment.endTime ? `${assignment.startTime.slice(0, 5)} - ${assignment.endTime.slice(0, 5)}` : '—',
      effectiveDate: this.formatDate(assignment.effectiveDate),
      endDate: assignment.endDate ? this.formatDate(assignment.endDate) : 'Không xác định thời hạn',
      status,
    };
  }

  private formatDate(value: string): string {
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
  }
}
