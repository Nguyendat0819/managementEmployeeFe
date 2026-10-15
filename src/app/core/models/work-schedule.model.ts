export interface ShiftDto {
  id: number;
  shiftName: string;
  startTime: string;
  endTime: string;
  dayOfWeek: string[];
  active: boolean;
  assignedCount: number;
}

export interface ShiftRequestDto {
  shiftName: string;
  startTime: string;
  endTime: string;
  dayOfWeek: string[];
  active: boolean;
}

export interface ShiftAssignmentDto {
  id: number;
  employeeCode: string;
  shiftId: number;
  shiftName: string | null;
  startTime: string | null;
  endTime: string | null;
  dayOfWeek: string[] | null;
  effectiveDate: string;
  endDate: string | null;
}

export interface ShiftAssignmentRequestDto {
  employeeCode: string;
  shiftId: number;
  effectiveDate: string;
  endDate: string | null;
}
