import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoint';
import { ApiResponse } from '@core/models/api-response.interface';
import { BaseService } from '@core/services/base.service';
import { environment } from '@env/environment';

export interface CreateNotificationRequest {
  userId: number;
  channel: string;
  title: string;
  content: string;
  category: string;
  type: 'info' | 'success' | 'warning' | 'default';
  icon: string;
}

@Injectable({ providedIn: 'root' })
export class AdminNotificationService extends BaseService {
  private readonly notificationsUrl = this.createServiceBase();

  send(request: CreateNotificationRequest): Observable<void> {
    return this.post<ApiResponse<unknown>>(`${this.notificationsUrl}/${API_ENDPOINTS.Notifications.BASE}`, request)
      .pipe(map(() => undefined));
  }

  private createServiceBase(): string {
    const configuredBase = Array.isArray(environment.apiBaseUrl) ? environment.apiBaseUrl[0] : environment.apiBaseUrl;
    return `${configuredBase.replace(/\/+$/, '')}/notification-service`;
  }
}
