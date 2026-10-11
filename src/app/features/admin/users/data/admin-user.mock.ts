import { AdminUser } from '../models/admin-user.model';

export const ADMIN_USERS: AdminUser[] = [
  { id: 1, userName: 'admin', fullName: 'Quản trị viên', email: 'admin@company.vn', roleCode: 'ADMIN', lastLoginAt: '07/10/2025 08:32', createdAt: '01/01/2025', status: 'Hoạt động' },
  { id: 2, userName: 'hr.manager', fullName: 'Nguyễn Thu Hằng', email: 'hang.nguyen@company.vn', roleCode: 'HR', lastLoginAt: '07/10/2025 08:15', createdAt: '03/01/2025', status: 'Hoạt động' },
  { id: 3, userName: 'it.lead', fullName: 'Nguyễn Minh Anh', email: 'anh.nguyen@company.vn', roleCode: 'MANAGER', lastLoginAt: '06/10/2025 17:45', createdAt: '05/01/2025', status: 'Hoạt động' },
  { id: 4, userName: 'sales.lead', fullName: 'Hoàng Thu Hà', email: 'ha.hoang@company.vn', roleCode: 'MANAGER', lastLoginAt: '06/10/2025 16:20', createdAt: '12/01/2025', status: 'Hoạt động' },
  { id: 5, userName: 'accountant', fullName: 'Phạm Đức Long', email: 'long.pham@company.vn', roleCode: 'EMPLOYEE', lastLoginAt: '06/10/2025 08:04', createdAt: '18/02/2025', status: 'Tạm khóa' },
  { id: 6, userName: 'marketing', fullName: 'Đặng Ngọc Mai', email: 'mai.dang@company.vn', roleCode: 'EMPLOYEE', lastLoginAt: '05/10/2025 09:16', createdAt: '20/02/2025', status: 'Hoạt động' },
];
