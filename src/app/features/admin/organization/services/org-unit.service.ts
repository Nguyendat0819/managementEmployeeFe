import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '@core/models/api-response.interface';
import { API_ENDPOINTS } from '@core/constants/api-endpoint';
import { BaseService } from '@core/services/base.service';
import {
  DepartmentCreateRequest,
  DepartmentUpdateRequest,
} from '../models/request.model';
import { DepartmentResponse, EmployeeResponse } from '../models/response.model';

export interface DepartmentQuery {
  search?: string;
  level?: number;
  parentCode?: string;
  isDeleted?: boolean;
}

@Injectable({ providedIn: 'root' })
export class OrgUnitService extends BaseService {
  private readonly endpoint = API_ENDPOINTS.Organization;

  getDepartments(query: DepartmentQuery = {}): Observable<ApiResponse<DepartmentResponse[]>> {
    const params: Record<string, string | number | boolean> = {};
    const search = query.search?.trim();
    const parentCode = query.parentCode?.trim();

    if (search) params['search'] = search;
    if (query.level !== undefined) params['level'] = query.level;
    if (parentCode) params['parentCode'] = parentCode;
    if (query.isDeleted !== undefined) params['isDeleted'] = query.isDeleted;

    return this.get<ApiResponse<DepartmentResponse[]>>('', this.endpoint.BASE, { params });
  }

  getEmployees(): Observable<ApiResponse<EmployeeResponse[]>> {
    return this.get<ApiResponse<EmployeeResponse[]>>('', API_ENDPOINTS.Employee.BASE);
  }

  createDepartment(request: DepartmentCreateRequest): Observable<ApiResponse<DepartmentResponse>> {
    return this.post<ApiResponse<DepartmentResponse>>('', request, this.endpoint.BASE);
  }

  updateDepartment(
    deptCode: string,
    request: DepartmentUpdateRequest,
  ): Observable<ApiResponse<DepartmentResponse>> {
    return this.put<ApiResponse<DepartmentResponse>>(
      this.endpoint.UPDATE(deptCode),
      request,
      this.endpoint.BASE,
    );
  }

  deleteDepartment(deptCode: string): Observable<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(
      this.endpoint.DELETE(deptCode),
      this.endpoint.BASE,
    );
  }

  getEmployeesByDepartment(deptCode: string): Observable<ApiResponse<EmployeeResponse[]>> {
    return this.get<ApiResponse<EmployeeResponse[]>>(
      this.endpoint.GETEMPLOYEE(deptCode),
      this.endpoint.BASE,
    );
  }
}
