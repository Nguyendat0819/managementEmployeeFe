export interface LeaveBalance {
  leaveTypeId: number;
  label: string;
  used: number;
  total: number;
  remaining: number;
  pending: number;
  tone: 'primary' | 'success' | 'warning';
}

export interface LeaveRequest {
  id: number;
  leaveTypeId: number;
  type: string;
  startDate: string;
  startDateIso?: string;
  endDate: string;
  days: number;
  reason: string;
  status: string;
  statusType: 'success' | 'warning' | 'error' | 'default';
  statusCode: string;
  evidenceUrl: string;
}
