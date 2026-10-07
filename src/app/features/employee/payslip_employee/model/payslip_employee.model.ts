export interface PayslipSummary {
  month: string;
  period: string;
  netSalary: string;
  paymentDate: string;
  bankName: string;
  accountNumber: string;
  status: string;
  statusType: 'success' | 'warning' | 'default';
}

export interface PayslipDetail {
  baseSalary: string;
  positionAllowance: string;
  lunchAllowance: string;
  overtime: string;
  grossSalary: string;
  socialInsurance: string;
  healthInsurance: string;
  personalTax: string;
  totalDeduction: string;
  netSalary: string;
}
