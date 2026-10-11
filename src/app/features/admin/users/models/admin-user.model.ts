export type AdminUserStatus = 'Hoạt động' | 'Tạm khóa';

export interface AdminUser {
  id: number;
  userName: string;
  fullName: string;
  email: string;
  roleCode: string;
  lastLoginAt: string;
  createdAt: string;
  status: AdminUserStatus;
}
