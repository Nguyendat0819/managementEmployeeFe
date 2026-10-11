export interface DepartmentResponse {
  id: number;
  deptCode: string;
  parentCode: string | null;
  name: string;
  code: string;
  headCode: string | null;
  level: number;
  isDeleted: boolean;
  employeeCount: number;
}

export interface OrganizationTreeRow {
  deptCode: string;
  parentCode: string;
  code: string;
  headCode: string;
  level: number;
  employeeCount: number;
  statusLabel: string;
}
