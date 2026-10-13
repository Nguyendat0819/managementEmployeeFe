export interface PermissionResponse {
  id: number;
  permissionCode: string;
  permissionName: string;
  description: string | null;
  isDeleted: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface PermissionCreateRequest {
  permissionCode: string;
  permissionName: string;
  description: string | null;
}

export interface PermissionUpdateRequest {
  permissionName: string;
  description: string | null;
}

export interface RolePermissionDto {
  role: string;
  permissions: string[];
}
