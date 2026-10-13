import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoint';
import { ApiResponse } from '@core/models/api-response.interface';
import { BaseService } from '@core/services/base.service';
import { ADMIN_PERMISSIONS, ADMIN_ROLE_PERMISSIONS, ADMIN_ROLES } from '../data/admin-role.mock';
import { PositionOption } from '../models/admin-role.model';

@Injectable({ providedIn: 'root' })
export class AdminRoleService extends BaseService {
  readonly roles = signal(ADMIN_ROLES.map((role) => ({ ...role })));
  readonly permissions = signal(ADMIN_PERMISSIONS.map((permission) => ({ ...permission })));
  readonly rolePermissions = signal<Record<string, string[]>>(Object.fromEntries(
    Object.entries(ADMIN_ROLE_PERMISSIONS).map(([roleCode, permissionCodes]) => [roleCode, [...permissionCodes]]),
  ));

  getPositions(): Observable<ApiResponse<PositionOption[]>> {
    return this.get<ApiResponse<PositionOption[]>>(
      API_ENDPOINTS.Role.POSITIONS,
      API_ENDPOINTS.Role.BASE,
    );
  }
}
