import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiResponse } from '@core/models/api-response.interface';
import { BaseService } from '@core/services/base.service';
import { environment } from '@env/environment';
import { EmployeeTask, EmployeeTaskProgress, EmployeeTaskProgressRequest, EmployeeTaskRequest, MonthlyTaskKpi } from '../models/employee-task.model';

@Injectable({ providedIn: 'root' })
export class EmployeeTaskApiService extends BaseService {
  private readonly baseUrl = this.createBaseUrl();
  private readonly tasksUrl = `${this.baseUrl}/api/tasks`;

  getMine(): Observable<EmployeeTask[]> {
    return this.get<ApiResponse<EmployeeTask[]>>(`${this.tasksUrl}/me`).pipe(map(({ data }) => data));
  }

  getAll(): Observable<EmployeeTask[]> {
    return this.get<ApiResponse<EmployeeTask[]>>(this.tasksUrl).pipe(map(({ data }) => data));
  }

  getMonthlyKpis(periodMonth: string): Observable<MonthlyTaskKpi[]> {
    return this.get<ApiResponse<MonthlyTaskKpi[]>>(`${this.tasksUrl}/kpi/monthly?periodMonth=${periodMonth}-01`).pipe(map(({ data }) => data));
  }

  getMyMonthlyKpi(periodMonth: string): Observable<MonthlyTaskKpi> {
    return this.get<ApiResponse<MonthlyTaskKpi>>(`${this.tasksUrl}/me/kpi/monthly?periodMonth=${periodMonth}-01`).pipe(map(({ data }) => data));
  }

  getHistory(id: number, mine = false): Observable<EmployeeTaskProgress[]> {
    const path = mine ? `${this.tasksUrl}/me/${id}/history` : `${this.tasksUrl}/${id}/history`;
    return this.get<ApiResponse<EmployeeTaskProgress[]>>(path).pipe(map(({ data }) => data));
  }

  create(request: EmployeeTaskRequest): Observable<EmployeeTask> {
    return this.getTask(this.post<ApiResponse<EmployeeTask>>(this.tasksUrl, request));
  }

  update(id: number, request: EmployeeTaskRequest): Observable<EmployeeTask> {
    return this.getTask(this.put<ApiResponse<EmployeeTask>>(`${this.tasksUrl}/${id}`, request));
  }

  start(id: number): Observable<EmployeeTask> {
    return this.getTask(this.post<ApiResponse<EmployeeTask>>(`${this.tasksUrl}/me/${id}/start`, {}));
  }

  submit(id: number, progress: EmployeeTaskProgressRequest, files: File[]): Observable<EmployeeTask> {
    const formData = new FormData();
    formData.append('submission', new Blob([JSON.stringify(progress)], { type: 'application/json' }));
    files.forEach((file) => formData.append('files', file, file.name));
    return this.http.post<ApiResponse<EmployeeTask>>(`${this.tasksUrl}/me/${id}/submit`, formData).pipe(
      map(({ data }) => data),
      catchError((error) => this.handleError(error)),
    );
  }

  approve(id: number, comment: string): Observable<EmployeeTask> {
    return this.getTask(this.post<ApiResponse<EmployeeTask>>(`${this.tasksUrl}/${id}/approve`, { comment }));
  }

  reject(id: number, comment: string): Observable<EmployeeTask> {
    return this.getTask(this.post<ApiResponse<EmployeeTask>>(`${this.tasksUrl}/${id}/reject`, { comment }));
  }

  private getTask(request: Observable<ApiResponse<EmployeeTask>>): Observable<EmployeeTask> {
    return request.pipe(map(({ data }) => data));
  }

  private createBaseUrl(): string {
    const configuredBase = Array.isArray(environment.apiBaseUrl)
      ? environment.apiBaseUrl[0]
      : environment.apiBaseUrl;
    return `${configuredBase.replace(/\/+$/, '')}/payroll-service`;
  }
}
