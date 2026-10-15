export interface AttendanceRecordDto {
  id: number;
  employeeCode: string;
  shiftId: number | null;
  shiftName: string | null;
  scheduledStartTime: string | null;
  scheduledEndTime: string | null;
  checkIn: string | null;
  checkOut: string | null;
  workDurationMin: number | null;
  workDurationHours: number | null;
  overtimeMin: number | null;
  lateMinutes: number | null;
  earlyMinutes: number | null;
  status: 'PRESENT' | 'INCOMPLETE' | string;
  note: string | null;
  recordedAt: string;
}

export interface AttendancePage<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
