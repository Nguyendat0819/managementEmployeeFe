import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoint';
import { ApiResponse } from '@core/models/api-response.interface';
import { AttendancePage, AttendanceRecordDto } from '@core/models/attendance.model';
import { BaseService, RequestOptions } from '@core/services/base.service';
import { environment } from '@env/environment';

export interface AttendanceSearch {
  from: string;
  to: string;
  employeeCode?: string;
  status?: string;
  page?: number;
  size?: number;
}

@Injectable({ providedIn: 'root' })
export class AttendanceApiService extends BaseService {
  private readonly baseUrl = this.createBaseUrl();

  checkIn(employeeCode: string, note?: string): Observable<ApiResponse<AttendanceRecordDto>> {
    return this.post<ApiResponse<AttendanceRecordDto>>(
      `${this.baseUrl}${API_ENDPOINTS.Attendance.CHECK_IN}`,
      { employeeCode, note },
    );
  }

  checkOut(employeeCode: string, note?: string): Observable<ApiResponse<AttendanceRecordDto>> {
    return this.post<ApiResponse<AttendanceRecordDto>>(
      `${this.baseUrl}${API_ENDPOINTS.Attendance.CHECK_OUT}`,
      { employeeCode, note },
    );
  }

  getHistory(employeeCode: string, from: string, to: string): Observable<ApiResponse<AttendanceRecordDto[]>> {
    const options: RequestOptions = { params: { employeeCode, from, to } };
    return this.get<ApiResponse<AttendanceRecordDto[]>>(
      `${this.baseUrl}${API_ENDPOINTS.Attendance.HISTORY}`,
      undefined,
      options,
    );
  }

  searchRecords(query: AttendanceSearch): Observable<ApiResponse<AttendancePage<AttendanceRecordDto>>> {
    const params = Object.fromEntries(
      Object.entries({ page: 0, size: 200, ...query }).filter(([, value]) => value !== undefined && value !== ''),
    ) as Record<string, string | number>;
    return this.get<ApiResponse<AttendancePage<AttendanceRecordDto>>>(
      `${this.baseUrl}${API_ENDPOINTS.Attendance.RECORDS}`,
      undefined,
      { params },
    );
  }

  private createBaseUrl(): string {
    const configuredBase = Array.isArray(environment.apiBaseUrl)
      ? environment.apiBaseUrl[0]
      : environment.apiBaseUrl;
    return `${configuredBase.replace(/\/+$/, '')}/attendance-service/${API_ENDPOINTS.Attendance.BASE}`;
  }
}
