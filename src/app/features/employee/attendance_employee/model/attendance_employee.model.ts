export interface AttendanceRecord {
  date: string;
  weekday: string;
  shiftName: string;
  checkIn: string;
  checkOut: string;
  duration: string;
  status: 'Đúng giờ' | 'Đi muộn' | 'Thiếu dữ liệu';
  statusType: 'success' | 'warning' | 'error';
}
