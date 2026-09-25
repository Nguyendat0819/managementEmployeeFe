export interface ApiResponse<T> {
  transactionTime?: string;
  code: string;
  message: string;
  data: T;
  traceId: string;
}

export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface IOptions {
  value: string;
  label: string;
}
export interface BaseDto {
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}