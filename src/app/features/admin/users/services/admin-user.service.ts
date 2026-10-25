import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '@core/models/api-response.interface';
import { BaseService } from '@core/services/base.service';
import { environment } from '@env/environment';
import { AdminUser } from '../models/admin-user.model';

export interface CreateAdminUserRequest {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  roleCode: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface PasswordResetRequest {
  id: number;
  userId: number;
  userName: string;
  fullName: string;
  email: string;
  requestedAt: string;
}

interface UserAccountResponse {
  id: number;
  email: string;
  userName: string;
  fullName: string;
  roleCode: string;
  status: string;
  lastLoginAt?: string | null;
  createdAt?: string | null;
}

interface UserPageResponse {
  content: UserAccountResponse[];
}

@Injectable({ providedIn: 'root' })
export class AdminUserService extends BaseService {
  private readonly usersUrl = `${this.createServiceBase()}/api/users`;

  getUsers(): Observable<AdminUser[]> {
    return this.get<ApiResponse<UserPageResponse>>(this.usersUrl)
      .pipe(map(({ data }) => data.content.map((user) => this.toModel(user))));
  }

  getPasswordResetRequests(): Observable<PasswordResetRequest[]> {
    return this.get<ApiResponse<PasswordResetRequest[]>>(`${this.usersUrl}/password-reset-requests`)
      .pipe(map(({ data }) => data ?? []));
  }

  createUser(request: CreateAdminUserRequest): Observable<AdminUser> {
    return this.post<ApiResponse<UserAccountResponse>>(this.usersUrl, request)
      .pipe(map(({ data }) => this.toModel(data)));
  }

  updateStatus(userName: string, action: 'REVOKE' | 'RESTORE'): Observable<AdminUser> {
    return this.post<ApiResponse<UserAccountResponse>>(
      `${this.usersUrl}/${encodeURIComponent(userName)}/status`,
      {},
      undefined,
      { params: { action } },
    ).pipe(map(({ data }) => this.toModel(data)));
  }

  resetPassword(userName: string, newPassword: string): Observable<void> {
    return this.put<ApiResponse<void>>(
      `${this.usersUrl}/${encodeURIComponent(userName)}/password`,
      { newPassword },
    ).pipe(map(() => undefined));
  }

  private toModel(user: UserAccountResponse): AdminUser {
    return {
      id: Number(user.id),
      userName: user.userName,
      fullName: user.fullName || user.userName,
      email: user.email,
      roleCode: user.roleCode,
      lastLoginAt: this.formatDateTime(user.lastLoginAt, 'Chưa đăng nhập'),
      createdAt: this.formatDateTime(user.createdAt, '—'),
      status: user.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm khóa',
    };
  }

  private formatDateTime(value: string | null | undefined, fallback: string): string {
    if (!value) return fallback;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString('vi-VN');
  }

  private createServiceBase(): string {
    const configuredBase = Array.isArray(environment.apiBaseUrl)
      ? environment.apiBaseUrl[0]
      : environment.apiBaseUrl;
    const base = configuredBase.replace(/\/+$/, '');
    const context = environment.contextPath
      ? `/${environment.contextPath.replace(/^\/+|\/+$/g, '')}`
      : '';
    return `${base}${context}`;
  }
}
