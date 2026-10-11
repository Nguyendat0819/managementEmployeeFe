import { AdminShiftAssignment } from '../models/admin-shift-assignment.model';

export const ADMIN_SHIFT_ASSIGNMENTS: AdminShiftAssignment[] = [
  { id: 1, employeeCode: 'NV-000128', employeeName: 'Nguyễn Minh Anh', department: 'Phòng Công nghệ thông tin', shiftId: 1, shiftName: 'Ca hành chính', shiftTime: '08:00 - 17:00', effectiveDate: '01/01/2025', endDate: '31/12/2025', status: 'Đang áp dụng' },
  { id: 2, employeeCode: 'NV-000129', employeeName: 'Trần Quốc Bảo', department: 'Phòng Kinh doanh', shiftId: 1, shiftName: 'Ca hành chính', shiftTime: '08:00 - 17:00', effectiveDate: '01/01/2025', endDate: '31/12/2025', status: 'Đang áp dụng' },
  { id: 3, employeeCode: 'NV-000130', employeeName: 'Lê Hoàng Phương', department: 'Phòng Nhân sự', shiftId: 1, shiftName: 'Ca hành chính', shiftTime: '08:00 - 17:00', effectiveDate: '01/01/2025', endDate: '31/12/2025', status: 'Đang áp dụng' },
  { id: 4, employeeCode: 'NV-000132', employeeName: 'Võ Thanh Tùng', department: 'Phòng Công nghệ thông tin', shiftId: 3, shiftName: 'Ca chiều', shiftTime: '14:00 - 22:00', effectiveDate: '01/10/2025', endDate: '31/12/2025', status: 'Đang áp dụng' },
  { id: 5, employeeCode: 'NV-000133', employeeName: 'Đặng Ngọc Mai', department: 'Phòng Marketing', shiftId: 1, shiftName: 'Ca hành chính', shiftTime: '08:00 - 17:00', effectiveDate: '01/11/2025', endDate: '31/12/2025', status: 'Sắp áp dụng' },
  { id: 6, employeeCode: 'NV-000134', employeeName: 'Nguyễn Văn Hùng', department: 'Phòng Vận hành', shiftId: 2, shiftName: 'Ca sáng', shiftTime: '06:00 - 14:00', effectiveDate: '01/01/2025', endDate: '31/12/2025', status: 'Đang áp dụng' },
  { id: 7, employeeCode: 'NV-000135', employeeName: 'Hoàng Thu Hà', department: 'Phòng Kinh doanh', shiftId: 1, shiftName: 'Ca hành chính', shiftTime: '08:00 - 17:00', effectiveDate: '01/01/2025', endDate: '31/08/2025', status: 'Đã kết thúc' },
  { id: 8, employeeCode: 'NV-000131', employeeName: 'Phạm Đức Long', department: 'Phòng Tài chính - Kế toán', shiftId: 4, shiftName: 'Ca đêm', shiftTime: '22:00 - 06:00', effectiveDate: '01/09/2025', endDate: '31/12/2025', status: 'Đang áp dụng' },
];
