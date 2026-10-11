export type AdminRoleStatus = 'Đang hoạt động' | 'Tạm khóa';

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
