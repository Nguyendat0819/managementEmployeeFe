export type AdminLeavePolicyStatus = 'Đang áp dụng' | 'Tạm khóa';

export interface AdminLeavePolicy {
  id: number;
  code: string;
  name: string;
  annualQuota: number;
  carryoverDays: number;
  paidLeave: boolean;
  requireDocument: boolean;
  status: AdminLeavePolicyStatus;
  description: string;
}
