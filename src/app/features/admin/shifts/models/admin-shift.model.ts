export interface AdminShift {
  id: number;
  shiftName: string;
  startTime: string;
  endTime: string;
  dayOfWeek: string[];
  dayLabel: string;
  assignedCount: number;
  status: 'Đang hoạt động' | 'Tạm ngưng';
}
