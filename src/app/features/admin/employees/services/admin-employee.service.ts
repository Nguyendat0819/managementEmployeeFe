import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, Page } from '@core/models/api-response.interface';
import { PageRequest } from '@core/models/api-request.interface';
import { API_ENDPOINTS } from '@core/constants/api-endpoint';
import { BaseService } from '@core/services/base.service';
import { ADMIN_CONTRACTS } from '../data/admin-employee.mock';
import { EmployeeRequest, EmployeeResponse } from '../models/admin-employee.model';

export interface EmployeeQuery {
  search?: string;
  departmentCode?: string;
  positionCode?: string;
  status?: string;
  employmentType?: string;
}

export interface EmployeeSearchRequest extends PageRequest {
  departmentCode?: string;
  positionCode?: string;
  status?: string;
  employmentType?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminEmployeeService extends BaseService {
  readonly contracts = ADMIN_CONTRACTS.map((contract) => ({ ...contract }));
  private readonly endpoint = API_ENDPOINTS.Employee;

  getEmployees(query: EmployeeQuery = {}): Observable<ApiResponse<EmployeeResponse[]>> {
    const params: Record<string, string> = {};
    for (const [key, value] of Object.entries(query)) {
      if (value?.trim()) params[key] = value.trim();
    }
    return this.get<ApiResponse<EmployeeResponse[]>>('', this.endpoint.BASE, { params });
  }

  searchEmployees(request: EmployeeSearchRequest): Observable<ApiResponse<Page<EmployeeResponse>>> {
    return this.post<ApiResponse<Page<EmployeeResponse>>>(
      this.endpoint.SEARCH,
      request,
      this.endpoint.BASE,
    );
  }

  getEmployee(id: number): Observable<ApiResponse<EmployeeResponse>> {
    return this.get<ApiResponse<EmployeeResponse>>(this.endpoint.DETAIL(id), this.endpoint.BASE);
  }

  createEmployee(request: EmployeeRequest): Observable<ApiResponse<EmployeeResponse>> {
    return this.post<ApiResponse<EmployeeResponse>>('', request, this.endpoint.BASE);
  }

  updateEmployee(id: number, request: EmployeeRequest): Observable<ApiResponse<EmployeeResponse>> {
    return this.put<ApiResponse<EmployeeResponse>>(this.endpoint.DETAIL(id), request, this.endpoint.BASE);
  }

  deleteEmployee(id: number): Observable<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(this.endpoint.DETAIL(id), this.endpoint.BASE);
  }

}
