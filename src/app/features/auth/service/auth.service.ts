import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env/environment';
import { RegisterRequest } from '../model/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthFeatureService {
  private readonly http = inject(HttpClient);

  register(request: RegisterRequest): Promise<unknown> {
    const url = `${environment.apiBaseUrl}/${environment.contextPath}/api/auth/register`;
    return firstValueFrom(this.http.post(url, { ...request, roleCode: 'USER' }));
  }
}
