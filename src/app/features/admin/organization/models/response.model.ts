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

export interface EmployeeResponse {
  id: number;
  employeeCode: string;
  user: number | null;
  fullName: string;
  birthDate: string | null;
  gender: string | null;
  idCard: string | null;
  phone: string | null;
  email: string | null;
  departmentCode: string | null;
  positionCode: string | null;
  employmentType: string;
  hireDate: string | null;
  contractEnd: string | null;
  status: string;
  isDeleted: boolean;
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
