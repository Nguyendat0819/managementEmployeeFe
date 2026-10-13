import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoint';
import { PageRequest } from '@core/models/api-request.interface';
import { ApiResponse, Page } from '@core/models/api-response.interface';
import { BaseService } from '@core/services/base.service';
import { ADMIN_PERMISSIONS, ADMIN_ROLE_PERMISSIONS } from '../data/admin-role.mock';
import { AdminRole, PositionOption, RoleCreateRequest, RoleResponse, RoleUpdateRequest } from '../models/admin-role.model';

export interface RoleSearchRequest extends PageRequest {
  roleCode?: string;
  isDeleted?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminRoleService extends BaseService {
  readonly roles = signal<AdminRole[]>([]);
  readonly totalRoles = signal(0);
  readonly permissions = signal(ADMIN_PERMISSIONS.map((permission) => ({ ...permission })));
  readonly rolePermissions = signal<Record<string, string[]>>(Object.fromEntries(
    Object.entries(ADMIN_ROLE_PERMISSIONS).map(([roleCode, permissionCodes]) => [roleCode, [...permissionCodes]]),
  ));
  private readonly endpoint = API_ENDPOINTS.Role;

  searchRoles(request: RoleSearchRequest): Observable<ApiResponse<Page<RoleResponse>>> {
    return this.post<ApiResponse<Page<RoleResponse>>>(
      this.endpoint.SEARCH,
      request,
      this.endpoint.BASE,
    );
  }

  getRole(id: number): Observable<ApiResponse<RoleResponse>> {
    return this.get<ApiResponse<RoleResponse>>(this.endpoint.DETAIL(id), this.endpoint.BASE);
  }

  createRole(request: RoleCreateRequest): Observable<ApiResponse<RoleResponse>> {
    return this.post<ApiResponse<RoleResponse>>('', request, this.endpoint.BASE);
  }

  updateRole(id: number, request: RoleUpdateRequest): Observable<ApiResponse<RoleResponse>> {
    return this.put<ApiResponse<RoleResponse>>(this.endpoint.DETAIL(id), request, this.endpoint.BASE);
  }

  deleteRole(id: number): Observable<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(this.endpoint.DETAIL(id), this.endpoint.BASE);
  }

  getPositions(): Observable<ApiResponse<PositionOption[]>> {
    return this.get<ApiResponse<PositionOption[]>>(
      this.endpoint.POSITIONS,
      this.endpoint.BASE,
    );
  }
}
