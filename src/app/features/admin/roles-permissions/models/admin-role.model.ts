export type AdminRoleStatus = 'Đang hoạt động' | 'Đã xóa';

export interface PositionOption {
  positionCode: string;
  title: string;
}

export interface AdminRole {
  id: number;
  code: string;
  name: string;
  description: string;
  userCount: number;
  permissionCount: number;
  status: AdminRoleStatus;
  updatedAt: string;
}

export interface RoleResponse {
  id: number;
  roleCode: string;
  roleName: string;
  description: string | null;
  userCount: number;
  permissionCount: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoleCreateRequest {
  roleCode: string;
  roleName: string;
  description: string | null;
}

export interface RoleUpdateRequest {
  roleName: string;
  description: string | null;
}
