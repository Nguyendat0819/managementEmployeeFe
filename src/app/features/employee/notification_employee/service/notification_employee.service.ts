import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoint';
import { ApiResponse } from '@core/models/api-response.interface';
import { BaseService } from '@core/services/base.service';
import { environment } from '@env/environment';
import { EmployeeNotification } from '../model/notification_employee.model';

@Injectable({ providedIn: 'root' })
export class NotificationEmployeeService extends BaseService {
  private readonly serviceBase = this.createServiceBase();

  getMine(): Observable<EmployeeNotification[]> {
    return this.get<ApiResponse<NotificationResponse[]>>(`${this.serviceBase}/${API_ENDPOINTS.Notifications.MINE}`)
      .pipe(map(({ data }) => (data ?? []).map((item) => this.toNotification(item))));
  }

  getUnreadCount(): Observable<number> {
    return this.get<ApiResponse<{ unreadCount: number }>>(`${this.serviceBase}/${API_ENDPOINTS.Notifications.UNREAD_COUNT}`)
      .pipe(map(({ data }) => Number(data?.unreadCount ?? 0)));
  }

  markAsRead(id: number): Observable<EmployeeNotification> {
    return this.patch<ApiResponse<NotificationResponse>>(`${this.serviceBase}${API_ENDPOINTS.Notifications.MARK_READ(id)}`, {})
      .pipe(map(({ data }) => this.toNotification(data)));
  }

  markAllAsRead(): Observable<number> {
    return this.patch<ApiResponse<{ updatedCount: number }>>(`${this.serviceBase}/${API_ENDPOINTS.Notifications.MARK_ALL_READ}`, {})
      .pipe(map(({ data }) => Number(data?.updatedCount ?? 0)));
  }

  private toNotification(item: NotificationResponse): EmployeeNotification {
    const createdAt = item.createdAt ? new Date(item.createdAt) : null;
    return {
      ...item,
      category: item.category || 'Thông tin chung',
      createdAtIso: item.createdAt,
      createdAt: createdAt && !Number.isNaN(createdAt.getTime())
        ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(createdAt)
        : '',
      icon: item.icon || 'bell',
      type: item.type === 'success' || item.type === 'warning' || item.type === 'default' ? item.type : 'info',
    };
  }

  private createServiceBase(): string {
    const configuredBase = Array.isArray(environment.apiBaseUrl) ? environment.apiBaseUrl[0] : environment.apiBaseUrl;
    return `${configuredBase.replace(/\/+$/, '')}/notification-service`;
  }
}

interface NotificationResponse {
  id: number;
  title: string;
  content: string;
  category: string | null;
  createdAt: string;
  icon: string | null;
  type: string | null;
  read: boolean;
  referenceType: string | null;
  referenceId: number | null;
}
