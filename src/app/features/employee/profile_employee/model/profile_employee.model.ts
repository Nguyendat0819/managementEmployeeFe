export interface EmployeeProfile {
  employeeCode: string;
  fullName: string;
  preferredName: string;
  birthDate: string;
  gender: string;
  idCard: string;
  phone: string;
  email: string;
  address: string;
  department: string;
  position: string;
  employmentType: string;
  hireDate: string;
  status: string;
}

export interface EmployeeProfileResponse {
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
  departmentName: string | null;
  positionCode: string | null;
  positionName: string | null;
  employmentType: string;
  hireDate: string;
  contractEnd: string | null;
  status: string;
  isDeleted: boolean;
}

export interface EmployeeContract {
  contractNo: string;
  contractType: string;
  startDate: string;
  endDate: string;
  signedDate: string;
  salary: string;
  department: string;
  position: string;
  status: string;
  statusType: 'success' | 'warning' | 'default';
}
