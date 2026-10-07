import { Injectable } from '@angular/core';
import { AttendanceRecord } from '../model/attendance_employee.model';

@Injectable({ providedIn: 'root' })
export class AttendanceEmployeeService {
  readonly records: AttendanceRecord[] = [
    { date: '07/10/2025', weekday: 'Thứ Ba', shiftName: 'Ca hành chính', checkIn: '07:58', checkOut: '17:02', duration: '08:04', status: 'Đúng giờ', statusType: 'success' },
    { date: '06/10/2025', weekday: 'Thứ Hai', shiftName: 'Ca hành chính', checkIn: '08:04', checkOut: '17:00', duration: '07:56', status: 'Đi muộn', statusType: 'warning' },
    { date: '03/10/2025', weekday: 'Thứ Sáu', shiftName: 'Ca hành chính', checkIn: '07:55', checkOut: '17:01', duration: '08:06', status: 'Đúng giờ', statusType: 'success' },
    { date: '02/10/2025', weekday: 'Thứ Năm', shiftName: 'Ca hành chính', checkIn: '08:00', checkOut: '17:00', duration: '08:00', status: 'Đúng giờ', statusType: 'success' },
  ];

}
