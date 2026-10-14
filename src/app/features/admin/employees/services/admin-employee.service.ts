import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, Page } from '@core/models/api-response.interface';
import { PageRequest } from '@core/models/api-request.interface';
import { API_ENDPOINTS } from '@core/constants/api-endpoint';
import { BaseService } from '@core/services/base.service';
import {
  EmployeeCatalogResponse,
  EmployeeContractRequest,
  EmployeeContractResponse,
  EmployeeRequest,
  EmployeeResponse,
} from '../models/admin-employee.model';

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

export interface EmployeeContractSearchRequest extends PageRequest {
  contractType?: string;
  employeeCode?: string;
  employmentType?: string;
  status?: string;
  isDeleted?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminEmployeeService extends BaseService {
  private readonly endpoint = API_ENDPOINTS.Employee;
  private readonly contractEndpoint = API_ENDPOINTS.EmployeeContract;

  getEmployees(query: EmployeeQuery = {}): Observable<ApiResponse<EmployeeResponse[]>> {
    const params: Record<string, string> = {};
    for (const [key, value] of Object.entries(query)) {
      if (value?.trim()) params[key] = value.trim();
    }
    return this.get<ApiResponse<EmployeeResponse[]>>('', this.endpoint.BASE, { params });
  }

  getCatalogs(): Observable<ApiResponse<EmployeeCatalogResponse>> {
    return this.get<ApiResponse<EmployeeCatalogResponse>>(this.endpoint.CATALOGS, this.endpoint.BASE);
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

  searchContracts(request: EmployeeContractSearchRequest): Observable<ApiResponse<Page<EmployeeContractResponse>>> {
    return this.post<ApiResponse<Page<EmployeeContractResponse>>>(
      this.contractEndpoint.SEARCH,
      request,
      this.contractEndpoint.BASE,
    );
  }

  getContract(id: number): Observable<ApiResponse<EmployeeContractResponse>> {
    return this.get<ApiResponse<EmployeeContractResponse>>(
      this.contractEndpoint.DETAIL(id),
      this.contractEndpoint.BASE,
    );
  }

  createContract(request: EmployeeContractRequest): Observable<ApiResponse<EmployeeContractResponse>> {
    return this.post<ApiResponse<EmployeeContractResponse>>('', request, this.contractEndpoint.BASE);
  }

  updateContract(id: number, request: EmployeeContractRequest): Observable<ApiResponse<EmployeeContractResponse>> {
    return this.put<ApiResponse<EmployeeContractResponse>>(
      this.contractEndpoint.DETAIL(id),
      request,
      this.contractEndpoint.BASE,
    );
  }

  deleteContract(id: number): Observable<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(this.contractEndpoint.DETAIL(id), this.contractEndpoint.BASE);
  }

}
