import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoint';
import { ApiResponse } from '@core/models/api-response.interface';
import { ShiftAssignmentDto, ShiftAssignmentRequestDto, ShiftDto, ShiftRequestDto } from '@core/models/work-schedule.model';
import { BaseService } from '@core/services/base.service';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class WorkScheduleApiService extends BaseService {
  private readonly serviceBase = this.createServiceBase();

  getShifts(): Observable<ApiResponse<ShiftDto[]>> {
    return this.get<ApiResponse<ShiftDto[]>>(`${this.serviceBase}/${API_ENDPOINTS.AttendanceShift.BASE}`);
  }

  createShift(request: ShiftRequestDto): Observable<ApiResponse<ShiftDto>> {
    return this.post<ApiResponse<ShiftDto>>(`${this.serviceBase}/${API_ENDPOINTS.AttendanceShift.BASE}`, request);
  }

  updateShift(id: number, request: ShiftRequestDto): Observable<ApiResponse<ShiftDto>> {
    return this.put<ApiResponse<ShiftDto>>(`${this.serviceBase}/${API_ENDPOINTS.AttendanceShift.BASE}/${id}`, request);
  }

  deleteShift(id: number): Observable<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`${this.serviceBase}/${API_ENDPOINTS.AttendanceShift.BASE}/${id}`);
  }

  getAssignments(): Observable<ApiResponse<ShiftAssignmentDto[]>> {
    return this.get<ApiResponse<ShiftAssignmentDto[]>>(`${this.serviceBase}/${API_ENDPOINTS.AttendanceShiftAssignment.BASE}`);
  }

  getCurrentAssignment(employeeCode: string, date: string): Observable<ApiResponse<ShiftAssignmentDto | null>> {
    return this.get<ApiResponse<ShiftAssignmentDto | null>>(
      `${this.serviceBase}/${API_ENDPOINTS.AttendanceShiftAssignment.BASE}/current`,
      undefined,
      { params: { employeeCode, date } },
    );
  }

  createAssignment(request: ShiftAssignmentRequestDto): Observable<ApiResponse<ShiftAssignmentDto>> {
    return this.post<ApiResponse<ShiftAssignmentDto>>(`${this.serviceBase}/${API_ENDPOINTS.AttendanceShiftAssignment.BASE}`, request);
  }

  updateAssignment(id: number, request: ShiftAssignmentRequestDto): Observable<ApiResponse<ShiftAssignmentDto>> {
    return this.put<ApiResponse<ShiftAssignmentDto>>(`${this.serviceBase}/${API_ENDPOINTS.AttendanceShiftAssignment.BASE}/${id}`, request);
  }

  deleteAssignment(id: number): Observable<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`${this.serviceBase}/${API_ENDPOINTS.AttendanceShiftAssignment.BASE}/${id}`);
  }

  private createServiceBase(): string {
    const configuredBase = Array.isArray(environment.apiBaseUrl)
      ? environment.apiBaseUrl[0]
      : environment.apiBaseUrl;
    return `${configuredBase.replace(/\/+$/, '')}/attendance-service`;
  }
}
