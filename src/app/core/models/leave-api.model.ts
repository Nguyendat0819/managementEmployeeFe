export interface LeaveRequestDto {
  id: number;
  requestCode: string;
  employeeUserId: number;
  employeeCode: string;
  employeeName: string;
  department: string | null;
  position: string | null;
  leaveTypeId: number;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  evidenceUrl: string | null;
  statusCode: string;
  status: string;
  submittedAt: string;
  processedAt: string | null;
  approver: string | null;
  decisionNote: string | null;
}

export interface LeaveBalanceDto {
  leaveTypeId: number;
  type: string;
  label: string;
  year: number;
  totalDays: number;
  usedDays: number;
  pendingDays: number;
  remainingDays: number;
}

export interface LeaveHolidayDto {
  id: number;
  startDate: string;
  endDate: string;
  name: string;
  type: string;
  notes: string | null;
}

export interface LeaveTypeDto {
  id: number;
  code: string;
  name: string;
  annualQuota: number;
  carryoverDays: number;
  paidLeave: boolean;
  requireDocument: boolean;
  active: boolean;
  status: string;
  description: string | null;
}

export interface SaveLeaveTypeDto {
  code: string;
  name: string;
  annualQuota: number;
  carryoverDays: number;
  paidLeave: boolean;
  requireDocument: boolean;
  active: boolean;
  description: string;
}

export interface LeaveRequestPageDto {
  content: LeaveRequestDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
