import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoint';
import { ApiResponse } from '@core/models/api-response.interface';
import { BaseService } from '@core/services/base.service';
import { environment } from '@env/environment';
import { AdminPayslip, AdminPayrollRun, PayslipLineRequest } from '../models/admin-payroll-run.model';

export interface PayrollRunRequest {
  periodYear: number;
  periodMonth: number;
  note: string;
}

@Injectable({ providedIn: 'root' })
export class AdminPayrollRunService extends BaseService {
  private readonly serviceBase = this.createServiceBase();
  private readonly runsUrl = API_ENDPOINTS.Payroll.PAYROLL_RUNS;

  getRuns(): Observable<AdminPayrollRun[]> {
    return this.get<ApiResponse<PayrollRunResponse[]>>(`${this.serviceBase}/${this.runsUrl}`)
      .pipe(map(({ data }) => data.map((item) => this.toRun(item))));
  }

  createRun(request: PayrollRunRequest): Observable<AdminPayrollRun> {
    return this.post<ApiResponse<PayrollRunResponse>>(`${this.serviceBase}/${this.runsUrl}`, request)
      .pipe(map(({ data }) => this.toRun(data)));
  }

  deleteRun(id: number): Observable<void> {
    return this.delete<ApiResponse<void>>(`${this.serviceBase}/${this.runsUrl}/${id}`).pipe(map(() => undefined));
  }

  getPayslips(runId: number): Observable<AdminPayslip[]> {
    return this.get<ApiResponse<AdminPayslipResponse[]>>(`${this.serviceBase}/${this.runsUrl}/${runId}/payslips`)
      .pipe(map(({ data }) => data.map((item) => this.toPayslip(item))));
  }

  addPayslip(runId: number, entry: PayslipLineRequest): Observable<AdminPayslip> {
    return this.post<ApiResponse<AdminPayslipResponse[]>>(`${this.serviceBase}/${this.runsUrl}/${runId}/payslips`, { entries: [entry] })
      .pipe(map(({ data }) => this.toPayslip(data[0])));
  }

  submitRun(id: number): Observable<AdminPayrollRun> {
    return this.runAction(id, 'submit');
  }

  approveRun(id: number): Observable<AdminPayrollRun> {
    return this.runAction(id, 'approve');
  }

  markRunPaid(id: number): Observable<AdminPayrollRun> {
    return this.runAction(id, 'mark-paid');
  }

  private runAction(id: number, action: string): Observable<AdminPayrollRun> {
    return this.post<ApiResponse<PayrollRunResponse>>(`${this.serviceBase}/${this.runsUrl}/${id}/${action}`, {})
      .pipe(map(({ data }) => this.toRun(data)));
  }

  private toRun(item: PayrollRunResponse): AdminPayrollRun {
    return {
      ...item,
      id: Number(item.id),
      periodYear: Number(item.periodYear),
      periodMonth: Number(item.periodMonth),
      employeeCount: Number(item.employeeCount ?? 0),
      totalGross: Number(item.totalGross ?? 0),
      totalDeduction: Number(item.totalDeduction ?? 0),
      totalNet: Number(item.totalNet ?? 0),
      createdAt: this.formatDateTime(item.createdAt),
      approvedAt: this.formatDateTime(item.approvedAt),
      paidAt: this.formatDateTime(item.paidAt),
      approvedBy: item.approvedBy ?? '',
      note: item.note ?? '',
    };
  }

  private toPayslip(item: AdminPayslipResponse): AdminPayslip {
    return {
      ...item,
      id: Number(item.id),
      payrollRunId: Number(item.payrollRunId),
      periodYear: Number(item.periodYear),
      periodMonth: Number(item.periodMonth),
      baseSalary: Number(item.baseSalary ?? 0),
      totalAllowance: Number(item.totalAllowance ?? 0),
      overtimePay: Number(item.overtimePay ?? 0),
      bonus: Number(item.bonus ?? 0),
      grossSalary: Number(item.grossSalary ?? 0),
      socialInsurance: Number(item.socialInsurance ?? 0),
      healthInsurance: Number(item.healthInsurance ?? 0),
      pitDeduction: Number(item.pitDeduction ?? 0),
      otherDeduction: Number(item.otherDeduction ?? 0),
      totalDeduction: Number(item.totalDeduction ?? 0),
      netSalary: Number(item.netSalary ?? 0),
      workingDays: Number(item.workingDays ?? 0),
      absentDays: Number(item.absentDays ?? 0),
      overtimeHours: Number(item.overtimeHours ?? 0),
      paymentDate: item.paymentDate ?? null,
      snapshotData: item.snapshotData ?? null,
    };
  }

  private formatDateTime(value: string | null | undefined): string {
    if (!value) return '';
    const [date, time] = value.split('T');
    const [year, month, day] = date.split('-');
    const dateLabel = year && month && day ? `${day}/${month}/${year}` : date;
    return time ? `${dateLabel} ${time.slice(0, 5)}` : dateLabel;
  }

  private createServiceBase(): string {
    const configuredBase = Array.isArray(environment.apiBaseUrl)
      ? environment.apiBaseUrl[0]
      : environment.apiBaseUrl;
    return `${configuredBase.replace(/\/+$/, '')}/payroll-service`;
  }
}

interface PayrollRunResponse extends Omit<AdminPayrollRun, 'createdAt' | 'approvedAt' | 'paidAt'> {
  id: number;
  periodYear: number;
  periodMonth: number;
  createdAt: string;
  approvedAt: string | null;
  paidAt: string | null;
  approvedBy: string | null;
  note: string | null;
}

interface AdminPayslipResponse extends Omit<AdminPayslip, 'paymentDate'> {
  id: number;
  payrollRunId: number;
  periodYear: number;
  periodMonth: number;
  paymentDate: string | null;
  snapshotData: Record<string, unknown> | null;
}
