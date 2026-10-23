import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoint';
import { ApiResponse } from '@core/models/api-response.interface';
import {
  LeaveBalanceDto,
  LeaveRequestDto,
  LeaveRequestPageDto,
  LeaveTypeDto,
  SaveLeaveTypeDto,
} from '@core/models/leave-api.model';
import { BaseService } from '@core/services/base.service';
import { environment } from '@env/environment';

export interface LeaveRequestSearch {
  status?: string;
  employeeCode?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

@Injectable({ providedIn: 'root' })
export class LeaveApiService extends BaseService {
  private readonly serviceBase = this.createServiceBase();

  getMyRequests(): Observable<LeaveRequestDto[]> {
    return this.get<ApiResponse<LeaveRequestDto[]>>(`${this.serviceBase}/${API_ENDPOINTS.Leave.MY_REQUESTS}`)
      .pipe(map(({ data }) => data ?? []));
  }

  getMyBalances(year: number): Observable<LeaveBalanceDto[]> {
    return this.get<ApiResponse<LeaveBalanceDto[]>>(`${this.serviceBase}/${API_ENDPOINTS.Leave.MY_BALANCES}`, undefined, { params: { year } })
      .pipe(map(({ data }) => data ?? []));
  }

  createRequest(request: {
    leaveTypeId: number;
    startDate: string;
    endDate: string;
    reason: string;
    evidenceUrl?: string;
  }): Observable<LeaveRequestDto> {
    return this.post<ApiResponse<LeaveRequestDto>>(`${this.serviceBase}/${API_ENDPOINTS.Leave.REQUESTS}`, request)
      .pipe(map(({ data }) => data));
  }

  cancelRequest(id: number): Observable<LeaveRequestDto> {
    return this.patch<ApiResponse<LeaveRequestDto>>(`${this.serviceBase}/${API_ENDPOINTS.Leave.MY_REQUESTS}/${id}/cancel`, {})
      .pipe(map(({ data }) => data));
  }

  searchRequests(query: LeaveRequestSearch = {}): Observable<LeaveRequestPageDto> {
    const params = Object.fromEntries(
      Object.entries({ page: 0, size: 200, ...query }).filter(([, value]) => value !== undefined && value !== ''),
    ) as Record<string, string | number>;
    return this.get<ApiResponse<LeaveRequestPageDto>>(`${this.serviceBase}/${API_ENDPOINTS.Leave.REQUESTS}`, undefined, { params })
      .pipe(map(({ data }) => data));
  }

  approveRequest(id: number): Observable<LeaveRequestDto> {
    return this.patch<ApiResponse<LeaveRequestDto>>(`${this.serviceBase}/${API_ENDPOINTS.Leave.REQUESTS}/${id}/approve`, {})
      .pipe(map(({ data }) => data));
  }

  rejectRequest(id: number, reason: string): Observable<LeaveRequestDto> {
    return this.patch<ApiResponse<LeaveRequestDto>>(`${this.serviceBase}/${API_ENDPOINTS.Leave.REQUESTS}/${id}/reject`, { reason })
      .pipe(map(({ data }) => data));
  }

  getLeaveTypes(includeInactive = false): Observable<LeaveTypeDto[]> {
    const endpoint = `${this.serviceBase}/${API_ENDPOINTS.Leave.TYPES}${includeInactive ? '/all' : ''}`;
    return this.get<ApiResponse<LeaveTypeDto[]>>(endpoint).pipe(map(({ data }) => data ?? []));
  }

  saveLeaveType(id: number | null, request: SaveLeaveTypeDto): Observable<LeaveTypeDto> {
    const endpoint = `${this.serviceBase}/${API_ENDPOINTS.Leave.TYPES}${id === null ? '' : `/${id}`}`;
    const result = id === null
      ? this.post<ApiResponse<LeaveTypeDto>>(endpoint, request)
      : this.put<ApiResponse<LeaveTypeDto>>(endpoint, request);
    return result.pipe(map(({ data }) => data));
  }

  deleteLeaveType(id: number): Observable<void> {
    return this.delete<ApiResponse<void>>(`${this.serviceBase}/${API_ENDPOINTS.Leave.TYPES}/${id}`).pipe(map(() => undefined));
  }

  private createServiceBase(): string {
    const configuredBase = Array.isArray(environment.apiBaseUrl) ? environment.apiBaseUrl[0] : environment.apiBaseUrl;
    return `${configuredBase.replace(/\/+$/, '')}/leave-service`;
  }
}
