import { Injectable } from '@angular/core';
import { LeaveBalance, LeaveRequest } from '../model/leave_employee.model';

@Injectable({ providedIn: 'root' })
export class LeaveEmployeeService {
  readonly balances: LeaveBalance[] = [
    { label: 'Phép năm', used: 2, total: 14, tone: 'primary' },
    { label: 'Phép ốm', used: 0, total: 5, tone: 'success' },
    { label: 'Phép đặc biệt', used: 0, total: 3, tone: 'warning' },
  ];

  readonly requests: LeaveRequest[] = [
    { type: 'Phép năm', startDate: '18/08/2025', endDate: '19/08/2025', days: '02 ngày', reason: 'Việc gia đình', status: 'Đã duyệt', statusType: 'success' },
    { type: 'Phép năm', startDate: '04/07/2025', endDate: '04/07/2025', days: '01 ngày', reason: 'Nghỉ cá nhân', status: 'Đã duyệt', statusType: 'success' },
    { type: 'Phép ốm', startDate: '12/05/2025', endDate: '12/05/2025', days: '01 ngày', reason: 'Khám sức khỏe', status: 'Đã hủy', statusType: 'default' },
  ];
}
