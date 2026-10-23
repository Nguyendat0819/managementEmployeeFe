export type AdminLeaveRequestStatus = 'Chờ duyệt' | 'Đã duyệt' | 'Từ chối' | 'Đã hủy';

export interface AdminLeaveRequest {
  id: number;
  requestCode: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  position: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  submittedAt: string;
  processedAt: string;
  approver: string;
  status: AdminLeaveRequestStatus;
  decisionNote: string;
  evidenceUrl?: string;
}
