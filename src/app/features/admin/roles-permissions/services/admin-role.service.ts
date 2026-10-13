import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoint';
import { PageRequest } from '@core/models/api-request.interface';
import { ApiResponse, Page } from '@core/models/api-response.interface';
import { BaseService } from '@core/services/base.service';
import { AdminRole, PositionOption, RoleCreateRequest, RoleResponse, RoleUpdateRequest } from '../models/admin-role.model';
import { PermissionCreateRequest, PermissionResponse, PermissionUpdateRequest, RolePermissionDto } from '../models/admin-permission.model';

export interface RoleSearchRequest extends PageRequest {
  roleCode?: string;
  isDeleted?: boolean;
}

export interface PermissionSearchRequest extends PageRequest {
  isDeleted?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminRoleService extends BaseService {
  readonly roles = signal<AdminRole[]>([]);
  readonly totalRoles = signal(0);
  readonly permissions = signal<PermissionResponse[]>([]);
  readonly rolePermissions = signal<Record<string, string[]>>({});
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

  searchPermissions(request: PermissionSearchRequest): Observable<ApiResponse<Page<PermissionResponse>>> {
    return this.post<ApiResponse<Page<PermissionResponse>>>(
      API_ENDPOINTS.Permission.SEARCH,
      request,
      API_ENDPOINTS.Permission.BASE,
    );
  }

  createPermission(request: PermissionCreateRequest): Observable<ApiResponse<PermissionResponse>> {
    return this.post<ApiResponse<PermissionResponse>>('', request, API_ENDPOINTS.Permission.BASE);
  }

  updatePermission(id: number, request: PermissionUpdateRequest): Observable<ApiResponse<PermissionResponse>> {
    return this.put<ApiResponse<PermissionResponse>>(API_ENDPOINTS.Permission.DETAIL(id), request, API_ENDPOINTS.Permission.BASE);
  }

  deletePermission(id: number): Observable<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(API_ENDPOINTS.Permission.DETAIL(id), API_ENDPOINTS.Permission.BASE);
  }

  getPermissionsByRole(roleCode: string): Observable<ApiResponse<RolePermissionDto[]>> {
    return this.get<ApiResponse<RolePermissionDto[]>>(
      '',
      API_ENDPOINTS.RolePermission.BASE,
      { params: { roleCodes: roleCode } },
    );
  }

  updateRolePermissions(roleCode: string, permissionCodes: string[]): Observable<ApiResponse<void>> {
    return this.put<ApiResponse<void>>(
      '',
      { permissionCodes },
      API_ENDPOINTS.RolePermission.BASE,
      { params: { roleCode } },
    );
  }

  assignRolePermission(roleCode: string, permissionCode: string): Observable<ApiResponse<void>> {
    return this.post<ApiResponse<void>>(
      '',
      { permissionCode },
      API_ENDPOINTS.RolePermission.BASE,
      { params: { roleCode } },
    );
  }

  deleteRolePermission(roleCode: string, permissionCode: string): Observable<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(
      '',
      API_ENDPOINTS.RolePermission.BASE,
      { params: { roleCode, permissionCode } },
    );
  }
}
