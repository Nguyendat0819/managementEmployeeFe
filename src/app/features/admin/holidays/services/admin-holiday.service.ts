import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoint';
import { ApiResponse } from '@core/models/api-response.interface';
import { BaseService } from '@core/services/base.service';
import { environment } from '@env/environment';
import { AdminHoliday } from '../models/admin-holiday.model';

export interface PayrollHolidayRequest {
  name: string;
  holidayType: string;
  holidayDate: string;
  holidayDateEnd: string;
  notes: string;
}

@Injectable({ providedIn: 'root' })
export class AdminHolidayService extends BaseService {
  private readonly serviceBase = this.createServiceBase();
  private readonly holidaysUrl = API_ENDPOINTS.Payroll.HOLIDAYS;

  getHolidays(): Observable<AdminHoliday[]> {
    return this.get<ApiResponse<AdminHoliday[]>>(`${this.serviceBase}/${this.holidaysUrl}`)
      .pipe(map(({ data }) => data.map((item) => this.toModel(item))));
  }

  createHoliday(request: PayrollHolidayRequest): Observable<AdminHoliday> {
    return this.post<ApiResponse<AdminHoliday>>(`${this.serviceBase}/${this.holidaysUrl}`, request)
      .pipe(map(({ data }) => this.toModel(data)));
  }

  updateHoliday(id: number, request: PayrollHolidayRequest): Observable<AdminHoliday> {
    return this.put<ApiResponse<AdminHoliday>>(`${this.serviceBase}/${this.holidaysUrl}/${id}`, request)
      .pipe(map(({ data }) => this.toModel(data)));
  }

  deleteHoliday(id: number): Observable<void> {
    return this.delete<ApiResponse<void>>(`${this.serviceBase}/${this.holidaysUrl}/${id}`).pipe(map(() => undefined));
  }

  private toModel(item: AdminHoliday): AdminHoliday {
    return {
      ...item,
      holidayDate: this.formatDate(item.holidayDate),
      holidayDateEnd: this.formatDate(item.holidayDateEnd),
    };
  }

  private formatDate(value: string): string {
    if (value.includes('/')) return value;
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
