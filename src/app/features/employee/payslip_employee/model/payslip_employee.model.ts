export interface PayslipSummary {
  id: number;
  month: string;
  period: string;
  netSalary: number;
  grossSalary: number;
  totalDeduction: number;
  baseSalary: number;
  totalAllowance: number;
  overtimePay: number;
  bonus: number;
  socialInsurance: number;
  healthInsurance: number;
  unemploymentInsurance: number;
  pitDeduction: number;
  otherDeduction: number;
  workingDays: number;
  absentDays: number;
  paidHolidayDays: number;
  overtimeHours: number;
  paymentDate: string;
  status: string;
  periodYear: number;
}
