export interface AdminAttendanceRecord {
  id: number;
  employeeCode: string;
  employeeName: string;
  department: string;
  shiftName: string;
  recordedAt: string;
  checkIn: string;
  checkOut: string;
  workDuration: string;
  overtime: string;
  status: 'Có mặt' | 'Đi muộn' | 'Vắng mặt' | 'Thiếu dữ liệu';
  note: string;
}
