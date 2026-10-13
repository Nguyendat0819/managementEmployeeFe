export type AdminPositionStatus = 'Đang hoạt động' | 'Đã xóa';

export interface AdminPosition {
  id: number;
  code: string;
  title: string;
  level: string;
  baseSalaryMin: number;
  baseSalaryMax: number;
  employeeCount: number;
  status: AdminPositionStatus;
  updatedAt: string;
}

export interface PositionResponse {
  id: number;
  positionCode: string;
  title: string;
  level: string;
  baseSalaryMin: number;
  baseSalaryMax: number;
  employeeCount: number;
  isDeleted: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface PositionCreateRequest {
  positionCode: string;
  title: string;
  level: string;
  baseSalaryMin: number;
  baseSalaryMax: number;
}

export interface PositionUpdateRequest {
  title: string;
  level: string;
  baseSalaryMin: number;
  baseSalaryMax: number;
}
