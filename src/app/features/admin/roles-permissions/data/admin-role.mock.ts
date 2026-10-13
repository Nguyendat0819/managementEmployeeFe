import { SsTransferItem } from '@platform/ui-kit';

export const ADMIN_PERMISSIONS: SsTransferItem[] = [
  { value: 'dashboard.read', label: 'Xem tổng quan', description: 'Truy cập dashboard quản trị' },
  { value: 'organization.read', label: 'Xem cơ cấu tổ chức', description: 'Xem phòng ban và đơn vị' },
  { value: 'organization.manage', label: 'Quản lý cơ cấu tổ chức', description: 'Thêm, sửa, xóa đơn vị' },
  { value: 'employee.read', label: 'Xem danh sách nhân viên', description: 'Tra cứu hồ sơ nhân sự' },
  { value: 'employee.manage', label: 'Quản lý nhân viên', description: 'Thêm, sửa và cập nhật nhân viên' },
  { value: 'contract.read', label: 'Xem hợp đồng lao động', description: 'Tra cứu hợp đồng nhân sự' },
  { value: 'contract.manage', label: 'Quản lý hợp đồng lao động', description: 'Thêm, sửa và kết thúc hợp đồng' },
  { value: 'shift.read', label: 'Xem ca làm việc', description: 'Tra cứu danh mục ca' },
  { value: 'shift.manage', label: 'Quản lý ca làm việc', description: 'Cấu hình ca và phân ca' },
  { value: 'holiday.manage', label: 'Quản lý ngày nghỉ lễ', description: 'Thiết lập lịch nghỉ lễ' },
  { value: 'attendance.read', label: 'Xem chấm công', description: 'Tra cứu dữ liệu chấm công' },
  { value: 'attendance.manage', label: 'Quản lý chấm công', description: 'Điều chỉnh và duyệt chấm công' },
  { value: 'leave.read', label: 'Xem đơn nghỉ phép', description: 'Tra cứu đơn nghỉ phép' },
  { value: 'leave.approve', label: 'Duyệt đơn nghỉ phép', description: 'Phê duyệt hoặc từ chối đơn' },
  { value: 'leave.manage', label: 'Cấu hình nghỉ phép', description: 'Thiết lập chính sách nghỉ phép' },
  { value: 'salary.read', label: 'Xem thang bảng lương', description: 'Tra cứu cấu trúc lương' },
  { value: 'salary.manage', label: 'Quản lý thang bảng lương', description: 'Cấu hình bậc và mức lương' },
  { value: 'payroll.manage', label: 'Quản lý kỳ tính lương', description: 'Tạo và chốt kỳ tính lương' },
  { value: 'user.read', label: 'Xem tài khoản người dùng', description: 'Tra cứu tài khoản truy cập' },
  { value: 'user.manage', label: 'Quản lý tài khoản người dùng', description: 'Tạo, khóa và xóa tài khoản' },
  { value: 'role.manage', label: 'Quản lý vai trò và phân quyền', description: 'Cấu hình vai trò và quyền truy cập' },
  { value: 'audit.read', label: 'Xem nhật ký hệ thống', description: 'Theo dõi lịch sử thao tác' },
];

export const ADMIN_ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: ADMIN_PERMISSIONS.map((permission) => permission.value),
  HR: ['dashboard.read', 'organization.read', 'employee.read', 'employee.manage', 'contract.read', 'contract.manage', 'shift.read', 'holiday.manage', 'attendance.read', 'attendance.manage', 'leave.read', 'leave.approve', 'leave.manage', 'user.read'],
  MANAGER: ['dashboard.read', 'employee.read', 'shift.read', 'attendance.read', 'leave.read', 'leave.approve', 'user.read', 'salary.read', 'payroll.manage'],
  EMPLOYEE: ['dashboard.read', 'attendance.read', 'leave.read', 'salary.read', 'contract.read'],
  ACCOUNTANT: ['dashboard.read', 'salary.read', 'salary.manage', 'payroll.manage', 'employee.read', 'contract.read'],
};
