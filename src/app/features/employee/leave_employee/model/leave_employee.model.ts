export interface LeaveBalance {
  label: string;
  used: number;
  total: number;
  tone: 'primary' | 'success' | 'warning';
}

export interface LeaveRequest {
  type: string;
  startDate: string;
  endDate: string;
  days: string;
  reason: string;
  status: string;
  statusType: 'success' | 'warning' | 'error' | 'default';
}
