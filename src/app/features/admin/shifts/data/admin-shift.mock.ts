import { AdminShift } from '../models/admin-shift.model';

export const ADMIN_SHIFTS: AdminShift[] = [
  { id: 1, shiftName: 'Ca hành chính', startTime: '08:00', endTime: '17:00', dayOfWeek: ['T2', 'T3', 'T4', 'T5', 'T6'], dayLabel: 'Thứ Hai - Thứ Sáu', assignedCount: 184, status: 'Đang hoạt động' },
  { id: 2, shiftName: 'Ca sáng', startTime: '06:00', endTime: '14:00', dayOfWeek: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7'], dayLabel: 'Thứ Hai - Thứ Bảy', assignedCount: 22, status: 'Đang hoạt động' },
  { id: 3, shiftName: 'Ca chiều', startTime: '14:00', endTime: '22:00', dayOfWeek: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7'], dayLabel: 'Thứ Hai - Thứ Bảy', assignedCount: 18, status: 'Đang hoạt động' },
  { id: 4, shiftName: 'Ca đêm', startTime: '22:00', endTime: '06:00', dayOfWeek: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'], dayLabel: 'Tất cả các ngày', assignedCount: 12, status: 'Đang hoạt động' },
  { id: 5, shiftName: 'Ca cuối tuần', startTime: '08:00', endTime: '12:00', dayOfWeek: ['T7', 'CN'], dayLabel: 'Thứ Bảy - Chủ Nhật', assignedCount: 8, status: 'Tạm ngưng' },
];
