import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoint';
import { ApiResponse } from '@core/models/api-response.interface';
import { BaseService } from '@core/services/base.service';
import { environment } from '@env/environment';
import { AdminSalaryStructure, AdminSalaryStructureStatus } from '../models/admin-salary-structure.model';

export interface SalaryStructureRequest {
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

@Injectable({ providedIn: 'root' })
export class AdminSalaryStructureService extends BaseService {
  private readonly serviceBase = this.createServiceBase();

  getStructures(search?: string): Observable<AdminSalaryStructure[]> {
    return this.get<ApiResponse<SalaryStructureResponse[]>>(
      `${this.serviceBase}/${API_ENDPOINTS.Payroll.SALARY_STRUCTURES}`,
      undefined,
      search ? { params: { search } } : undefined,
    ).pipe(map(({ data }) => data.map((item) => this.toModel(item))));
  }

  saveStructure(request: SalaryStructureRequest, id?: number): Observable<AdminSalaryStructure> {
    const operation = id
      ? this.put<ApiResponse<SalaryStructureResponse>>(`${this.serviceBase}/${API_ENDPOINTS.Payroll.SALARY_STRUCTURES}/${id}`, request)
      : this.post<ApiResponse<SalaryStructureResponse>>(`${this.serviceBase}/${API_ENDPOINTS.Payroll.SALARY_STRUCTURES}`, request);
    return operation.pipe(map(({ data }) => this.toModel(data)));
  }

  deleteStructure(id: number): Observable<void> {
    return this.delete<ApiResponse<void>>(`${this.serviceBase}/${API_ENDPOINTS.Payroll.SALARY_STRUCTURES}/${id}`).pipe(map(() => undefined));
  }

  private toModel(item: SalaryStructureResponse): AdminSalaryStructure {
    return {
      ...item,
      id: Number(item.id),
      baseSalary: Number(item.baseSalary),
      allowanceTotal: Number(item.allowanceTotal),
      effectiveDate: this.formatDate(item.effectiveDate),
      status: item.status as AdminSalaryStructureStatus,
    };
  }

  private formatDate(value: string): string {
    const [year, month, day] = value.split('-');
    return year && month && day ? `${day}/${month}/${year}` : value;
  }

  private createServiceBase(): string {
    const configuredBase = Array.isArray(environment.apiBaseUrl)
      ? environment.apiBaseUrl[0]
      : environment.apiBaseUrl;
    return `${configuredBase.replace(/\/+$/, '')}/payroll-service`;
  }
}

interface SalaryStructureResponse extends Omit<AdminSalaryStructure, 'effectiveDate' | 'baseSalary' | 'allowanceTotal'> {
  id: number;
  baseSalary: number | string;
  allowanceTotal: number | string;
  effectiveDate: string;
}
