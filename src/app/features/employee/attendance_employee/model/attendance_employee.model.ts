export interface AttendanceRecord {
  date: string;
  weekday: string;
  shiftName: string;
  checkIn: string;
  checkOut: string;
  durationMinutes: number | null;
  overtimeMinutes: number | null;
  duration: string;
  overtime: string;
  status: 'Đúng giờ' | 'Đi muộn' | 'Thiếu dữ liệu' | 'Chưa có ca';
  statusType: 'success' | 'warning' | 'error';
}
