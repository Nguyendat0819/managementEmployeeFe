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
