import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoint';
import { ApiResponse } from '@core/models/api-response.interface';
import { BaseService } from '@core/services/base.service';
import { environment } from '@env/environment';
import { PayslipSummary } from '../model/payslip_employee.model';

@Injectable({ providedIn: 'root' })
export class PayslipEmployeeService extends BaseService {
  private readonly serviceBase = this.createServiceBase();

  getMyPayslips(): Observable<PayslipSummary[]> {
    return this.get<ApiResponse<PayslipResponse[]>>(`${this.serviceBase}/${API_ENDPOINTS.Payroll.MY_PAYSLIPS}`)
      .pipe(map(({ data }) => data.map((item) => this.toModel(item))));
  }

  private toModel(item: PayslipResponse): PayslipSummary {
    const start = this.formatDate(item.periodStart);
    const end = this.formatDate(item.periodEnd);
    return {
      id: Number(item.id),
      month: `${String(item.periodMonth).padStart(2, '0')}/${item.periodYear}`,
      period: `${start} - ${end}`,
      netSalary: Number(item.netSalary ?? 0),
      grossSalary: Number(item.grossSalary ?? 0),
      totalDeduction: Number(item.totalDeduction ?? 0),
      baseSalary: Number(item.baseSalary ?? 0),
      totalAllowance: Number(item.totalAllowance ?? 0),
      overtimePay: Number(item.overtimePay ?? 0),
      bonus: Number(item.bonus ?? 0),
      socialInsurance: Number(item.socialInsurance ?? 0),
      healthInsurance: Number(item.healthInsurance ?? 0),
      unemploymentInsurance: Number(item.unemploymentInsurance ?? 0),
      pitDeduction: Number(item.pitDeduction ?? 0),
      otherDeduction: Number(item.otherDeduction ?? 0),
      workingDays: Number(item.workingDays ?? 0),
      absentDays: Number(item.absentDays ?? 0),
      paidHolidayDays: Number(item.snapshotData?.['paidHolidayDays'] ?? 0),
      overtimeHours: Number(item.overtimeHours ?? 0),
      paymentDate: this.formatDateTime(item.paymentDate),
      status: item.status,
      periodYear: Number(item.periodYear),
    };
  }

  private formatDate(value: string): string {
    const [year, month, day] = value.split('-');
    return year && month && day ? `${day}/${month}/${year}` : value;
  }

  private formatDateTime(value: string | null): string {
    if (!value) return '—';
    const [date, time] = value.split('T');
    return `${this.formatDate(date)}${time ? ` ${time.slice(0, 5)}` : ''}`;
  }

  private createServiceBase(): string {
    const configuredBase = Array.isArray(environment.apiBaseUrl)
      ? environment.apiBaseUrl[0]
      : environment.apiBaseUrl;
    return `${configuredBase.replace(/\/+$/, '')}/payroll-service`;
  }
}

interface PayslipResponse {
  id: number;
  periodYear: number;
  periodMonth: number;
  periodStart: string;
  periodEnd: string;
  status: string;
  paymentDate: string | null;
  baseSalary: number | string;
  totalAllowance: number | string;
  overtimePay: number | string;
  bonus: number | string;
  grossSalary: number | string;
  socialInsurance: number | string;
  healthInsurance: number | string;
  unemploymentInsurance: number | string;
  pitDeduction: number | string;
  otherDeduction: number | string;
  totalDeduction: number | string;
  netSalary: number | string;
  workingDays: number;
  absentDays: number;
  overtimeHours: number | string;
  snapshotData: Record<string, unknown> | null;
}
