import { AdminAttendanceRecord } from '../models/admin-attendance.model';

export const ADMIN_ATTENDANCE_RECORDS: AdminAttendanceRecord[] = [
  { id: 1, employeeCode: 'NV-000128', employeeName: 'Nguyễn Minh Anh', department: 'Công nghệ thông tin', shiftName: 'Ca hành chính', recordedAt: '07/10/2025', checkIn: '07:58', checkOut: '17:02', workDuration: '08:04', overtime: '00:02', status: 'Có mặt', note: '' },
  { id: 2, employeeCode: 'NV-000129', employeeName: 'Trần Quốc Bảo', department: 'Kinh doanh', shiftName: 'Ca hành chính', recordedAt: '07/10/2025', checkIn: '08:16', checkOut: '17:01', workDuration: '07:45', overtime: '00:01', status: 'Đi muộn', note: 'Kẹt xe trên đường đến văn phòng.' },
  { id: 3, employeeCode: 'NV-000130', employeeName: 'Lê Hoàng Phương', department: 'Nhân sự', shiftName: 'Ca hành chính', recordedAt: '07/10/2025', checkIn: '07:54', checkOut: '17:00', workDuration: '08:06', overtime: '00:00', status: 'Có mặt', note: '' },
  { id: 4, employeeCode: 'NV-000132', employeeName: 'Võ Thanh Tùng', department: 'Công nghệ thông tin', shiftName: 'Ca chiều', recordedAt: '07/10/2025', checkIn: '13:57', checkOut: '22:04', workDuration: '08:07', overtime: '00:04', status: 'Có mặt', note: '' },
  { id: 5, employeeCode: 'NV-000133', employeeName: 'Đặng Ngọc Mai', department: 'Marketing', shiftName: 'Ca hành chính', recordedAt: '07/10/2025', checkIn: '--:--', checkOut: '--:--', workDuration: '--:--', overtime: '00:00', status: 'Vắng mặt', note: 'Chưa có đơn nghỉ phép được duyệt.' },
  { id: 6, employeeCode: 'NV-000134', employeeName: 'Nguyễn Văn Hùng', department: 'Vận hành', shiftName: 'Ca sáng', recordedAt: '07/10/2025', checkIn: '05:57', checkOut: '14:00', workDuration: '08:03', overtime: '00:00', status: 'Có mặt', note: '' },
  { id: 7, employeeCode: 'NV-000135', employeeName: 'Hoàng Thu Hà', department: 'Kinh doanh', shiftName: 'Ca hành chính', recordedAt: '07/10/2025', checkIn: '08:00', checkOut: '--:--', workDuration: '--:--', overtime: '00:00', status: 'Thiếu dữ liệu', note: 'Chưa ghi nhận check-out.' },
  { id: 8, employeeCode: 'NV-000131', employeeName: 'Phạm Đức Long', department: 'Tài chính - Kế toán', shiftName: 'Ca đêm', recordedAt: '06/10/2025', checkIn: '21:56', checkOut: '06:02', workDuration: '08:06', overtime: '00:02', status: 'Có mặt', note: '' },
];
