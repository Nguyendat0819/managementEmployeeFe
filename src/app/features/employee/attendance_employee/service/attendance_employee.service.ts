import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AttendanceRecordDto } from '@core/models/attendance.model';
import { AttendanceApiService } from '@core/services/attendance-api.service';
import { AttendanceRecord } from '../model/attendance_employee.model';

@Injectable({ providedIn: 'root' })
export class AttendanceEmployeeService {
  constructor(private readonly attendanceApi: AttendanceApiService) {}

  getHistory(employeeCode: string, from: string, to: string): Observable<AttendanceRecord[]> {
    return this.attendanceApi.getHistory(employeeCode, from, to).pipe(
      map((response) => response.data.map((record) => this.toViewModel(record))),
    );
  }

  checkIn(employeeCode: string): Observable<AttendanceRecordDto> {
    return this.attendanceApi.checkIn(employeeCode).pipe(map((response) => response.data));
  }

  checkOut(employeeCode: string): Observable<AttendanceRecordDto> {
    return this.attendanceApi.checkOut(employeeCode).pipe(map((response) => response.data));
  }

  toViewModel(record: AttendanceRecordDto): AttendanceRecord {
    const date = new Date(`${record.recordedAt}T00:00:00`);
    const durationMinutes = this.toValidMinutes(record.workDurationMin);
    const overtimeMinutes = record.status === 'NO_SHIFT' ? null : this.toValidMinutes(record.overtimeMin);
    const status = record.status === 'NO_SHIFT'
      ? 'Chưa có ca'
      : record.lateMinutes && record.lateMinutes > 0 || record.status === 'LATE'
        ? 'Đi muộn'
        : record.status === 'INCOMPLETE' ? 'Thiếu dữ liệu' : 'Đúng giờ';
    return {
      date: new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date),
      weekday: new Intl.DateTimeFormat('vi-VN', { weekday: 'long' }).format(date),
      shiftName: record.shiftName ?? '—',
      checkIn: this.toTime(record.checkIn),
      checkOut: this.toTime(record.checkOut),
      durationMinutes,
      overtimeMinutes,
      duration: this.formatMinutes(durationMinutes),
      overtime: this.formatMinutes(overtimeMinutes),
      status,
      statusType: status === 'Đi muộn' ? 'error' : status === 'Thiếu dữ liệu' || status === 'Chưa có ca' ? 'warning' : 'success',
    };
  }

  private toTime(value: string | null): string {
    return value ? value.slice(11, 16) : '--:--';
  }

  private toValidMinutes(value: number | null | undefined): number | null {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
  }

  private formatMinutes(value: number | null): string {
    if (value === null || !Number.isFinite(value) || value < 0) return '-';
    if (value < 60) return `${value} phút`;
    return `${Math.floor(value / 60)} giờ ${value % 60} phút`;
  }
}
