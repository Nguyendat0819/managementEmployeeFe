import { Injectable } from '@angular/core';
import { PayslipDetail, PayslipSummary } from '../model/payslip_employee.model';

@Injectable({ providedIn: 'root' })
export class PayslipEmployeeService {
  readonly payslips: PayslipSummary[] = [
    { month: '09/2025', period: '01/09/2025 - 30/09/2025', netSalary: '21.850.000 VNĐ', paymentDate: '05/10/2025', bankName: 'Vietcombank', accountNumber: '•••• •••• 6789', status: 'Đã thanh toán', statusType: 'success' },
    { month: '08/2025', period: '01/08/2025 - 31/08/2025', netSalary: '22.180.000 VNĐ', paymentDate: '05/09/2025', bankName: 'Vietcombank', accountNumber: '•••• •••• 6789', status: 'Đã thanh toán', statusType: 'success' },
    { month: '07/2025', period: '01/07/2025 - 31/07/2025', netSalary: '21.850.000 VNĐ', paymentDate: '05/08/2025', bankName: 'Vietcombank', accountNumber: '•••• •••• 6789', status: 'Đã thanh toán', statusType: 'success' },
    { month: '06/2025', period: '01/06/2025 - 30/06/2025', netSalary: '21.420.000 VNĐ', paymentDate: '05/07/2025', bankName: 'Vietcombank', accountNumber: '•••• •••• 6789', status: 'Đã thanh toán', statusType: 'success' },
  ];

  readonly latestDetail: PayslipDetail = {
    baseSalary: '20.000.000 VNĐ',
    positionAllowance: '3.000.000 VNĐ',
    lunchAllowance: '730.000 VNĐ',
    overtime: '1.200.000 VNĐ',
    grossSalary: '24.930.000 VNĐ',
    socialInsurance: '- 2.000.000 VNĐ',
    healthInsurance: '- 375.000 VNĐ',
    personalTax: '- 705.000 VNĐ',
    totalDeduction: '- 3.080.000 VNĐ',
    netSalary: '21.850.000 VNĐ',
  };
}
