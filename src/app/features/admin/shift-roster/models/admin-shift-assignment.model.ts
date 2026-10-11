export interface AdminShiftAssignment {
  id: number;
  employeeCode: string;
  employeeName: string;
  department: string;
  shiftId: number;
  shiftName: string;
  shiftTime: string;
  effectiveDate: string;
  endDate: string;
  status: 'Đang áp dụng' | 'Sắp áp dụng' | 'Đã kết thúc';
}
