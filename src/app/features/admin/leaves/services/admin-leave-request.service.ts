import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { LeaveApiService } from '@core/services/leave-api.service';
import { LeaveRequestDto } from '@core/models/leave-api.model';
import { AdminLeaveRequest, AdminLeaveRequestStatus } from '../models/admin-leave-request.model';

@Injectable({ providedIn: 'root' })
export class AdminLeaveRequestService {
  constructor(private readonly leaveApi: LeaveApiService) {}

  getRequests(): Observable<AdminLeaveRequest[]> {
    return this.leaveApi.searchRequests({ page: 0, size: 100 })
      .pipe(map((page) => page.content.map((request) => this.toRequest(request))));
  }

  approve(id: number): Observable<AdminLeaveRequest> {
    return this.leaveApi.approveRequest(id).pipe(map((request) => this.toRequest(request)));
  }

  reject(id: number, reason: string): Observable<AdminLeaveRequest> {
    return this.leaveApi.rejectRequest(id, reason).pipe(map((request) => this.toRequest(request)));
  }

  private toRequest(item: LeaveRequestDto): AdminLeaveRequest {
    return {
      id: item.id,
      requestCode: item.requestCode,
      employeeCode: item.employeeCode || '',
      employeeName: item.employeeName || item.employeeCode || 'Nhân viên',
      department: item.department || '—',
      position: item.position || '—',
      type: item.type || 'Nghỉ phép',
      startDate: this.formatDate(item.startDate),
      endDate: this.formatDate(item.endDate),
      days: Number(item.days ?? 0),
      reason: item.reason || '',
      submittedAt: this.formatDateTime(item.submittedAt),
      processedAt: this.formatDateTime(item.processedAt),
      approver: item.approver || '',
      status: this.toStatus(item.statusCode, item.status),
      decisionNote: item.decisionNote || '',
      evidenceUrl: item.evidenceUrl || '',
    };
  }

  private toStatus(code: string, label: string): AdminLeaveRequestStatus {
    const labels: Record<string, AdminLeaveRequestStatus> = {
      PENDING: 'Chờ duyệt', APPROVED: 'Đã duyệt', REJECTED: 'Từ chối', CANCELLED: 'Đã hủy',
    };
    return labels[code] ?? (label as AdminLeaveRequestStatus);
  }

  private formatDate(value: string | null): string {
    if (!value) return '';
    const [year, month, day] = value.slice(0, 10).split('-');
    return year && month && day ? `${day}/${month}/${year}` : value;
  }

  private formatDateTime(value: string | null): string {
    if (!value) return '';
    const [date, time] = value.split('T');
    return `${this.formatDate(date)}${time ? ` ${time.slice(0, 5)}` : ''}`;
  }
}
