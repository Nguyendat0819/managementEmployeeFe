export type AdminPayrollRunStatus = 'Nháp' | 'Chờ duyệt' | 'Đã duyệt' | 'Đã trả';

export interface AdminPayrollRun {
  id: number;
  periodYear: number;
  periodMonth: number;
  periodLabel: string;
  salaryStructureLabel: string;
  employeeCount: number;
  totalGross: number;
  totalDeduction: number;
  totalNet: number;
  status: AdminPayrollRunStatus;
  createdAt: string;
  approvedBy: string;
  approvedAt: string;
  paidAt: string;
  note: string;
}

export interface AdminPayslip {
  id: number;
  payrollRunId: number;
  employeeCode: string;
  periodYear: number;
  periodMonth: number;
  periodStart: string;
  periodEnd: string;
  status: string;
  paymentDate: string | null;
  baseSalary: number;
  totalAllowance: number;
  overtimePay: number;
  bonus: number;
  grossSalary: number;
  socialInsurance: number;
  healthInsurance: number;
  pitDeduction: number;
  otherDeduction: number;
  totalDeduction: number;
  netSalary: number;
  workingDays: number;
  absentDays: number;
  overtimeHours: number;
  snapshotData: Record<string, unknown> | null;
}

export interface PayslipLineRequest {
  employeeCode: string;
  baseSalary: number;
  totalAllowance: number;
  overtimePay: number;
  bonus: number;
  socialInsurance: number;
  healthInsurance: number;
  pitDeduction: number;
  otherDeduction: number;
  workingDays: number;
  absentDays: number;
  overtimeHours: number;
  snapshotData?: Record<string, unknown>;
}
