import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AttendanceRecordDto } from '@core/models/attendance.model';
import { AttendanceApiService } from '@core/services/attendance-api.service';
import { AdminAttendanceRecord } from '../models/admin-attendance.model';

@Injectable({ providedIn: 'root' })
export class AdminAttendanceService {
  constructor(private readonly attendanceApi: AttendanceApiService) {}

  getRecords(from: string, to: string): Observable<AdminAttendanceRecord[]> {
    return this.attendanceApi.searchRecords({ from, to }).pipe(
      map((response) => response.data.content.map((record) => this.toViewModel(record))),
    );
  }

  private toViewModel(record: AttendanceRecordDto): AdminAttendanceRecord {
    const status: AdminAttendanceRecord['status'] = record.status === 'NO_SHIFT'
      ? 'Chưa có ca'
      : record.status === 'INCOMPLETE' ? 'Thiếu dữ liệu'
        : record.status === 'LATE' ? 'Đi muộn' : 'Có mặt';
    return {
      id: record.id,
      employeeCode: record.employeeCode,
      employeeName: record.employeeCode,
      department: '—',
      shiftName: record.shiftName ?? '—',
      recordedAt: new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
        .format(new Date(`${record.recordedAt}T00:00:00`)),
      checkIn: this.toTime(record.checkIn),
      checkOut: this.toTime(record.checkOut),
      workDuration: this.formatMinutes(record.workDurationMin),
      overtime: status === 'Chưa có ca' ? '—' : this.formatMinutes(record.overtimeMin),
      status,
      note: record.note ?? '',
    };
  }

  private toTime(value: string | null): string {
    return value ? value.slice(11, 16) : '--:--';
  }

  private formatMinutes(value: number | null): string {
    if (value === null) return '--:--';
    return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
  }
}
