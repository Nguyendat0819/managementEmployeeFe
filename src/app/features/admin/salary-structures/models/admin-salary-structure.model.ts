export type AdminSalaryStructureStatus = 'Đang áp dụng' | 'Chờ áp dụng' | 'Ngừng áp dụng';

export interface AdminSalaryStructure {
  id: number;
  positionCode: string;
  positionName: string;
  grade: string;
  baseSalary: number;
  allowanceTotal: number;
  allowanceSummary: string;
  effectiveDate: string;
  status: AdminSalaryStructureStatus;
  formula: string;
  note: string;
}
