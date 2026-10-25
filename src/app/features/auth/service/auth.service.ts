import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env/environment';
import { RegisterRequest } from '../model/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthFeatureService {
  private readonly http = inject(HttpClient);

  register(request: RegisterRequest): Promise<unknown> {
    const url = this.authUrl('/register');
    return firstValueFrom(this.http.post(url, { ...request, roleCode: 'USER' }));
  }

  changePassword(request: { currentPassword: string; newPassword: string }): Promise<void> {
    return firstValueFrom(this.http.post<void>(this.authUrl('/change-password'), request));
  }

  requestAdminPasswordReset(email: string): Promise<unknown> {
    return firstValueFrom(this.http.post(this.authUrl('/forgot-password'), { email }));
  }

  private authUrl(path: string): string {
    const configuredBase = Array.isArray(environment.apiBaseUrl)
      ? environment.apiBaseUrl[0]
      : environment.apiBaseUrl;
    const base = configuredBase.replace(/\/+$/, '');
    const context = environment.contextPath
      ? `/${environment.contextPath.replace(/^\/+|\/+$/g, '')}`
      : '';
    return `${base}${context}/api/auth${path}`;
  }
}
