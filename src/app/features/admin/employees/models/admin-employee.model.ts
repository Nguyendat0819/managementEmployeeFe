export interface AdminEmployee {
  id: number;
  employeeCode: string;
  fullName: string;
  birthDate: string;
  gender: string;
  idCard: string;
  phone: string;
  email: string;
  department: string;
  departmentCode: string;
  positionCode: string;
  position: string;
  employmentType: string;
  hireDate: string;
  contractEnd: string;
  status: string;
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
  departmentName: string | null;
  positionCode: string | null;
  positionName: string | null;
  employmentType: string;
  hireDate: string;
  contractEnd: string | null;
  status: string;
  isDeleted: boolean;
}

export interface EmployeeRequest {
  employeeCode: string;
  fullName: string;
  birthDate: string | null;
  gender: string | null;
  idCard: string | null;
  phone: string | null;
  email: string | null;
  departmentCode: string;
  positionCode: string;
  employmentType: string;
  hireDate: string;
  contractEnd: string | null;
  status: string;
}

export interface AdminContract {
  id: number;
  contractNo: string;
  contractType: string;
  employeeCode: string;
  fullName: string;
  department: string;
  position: string;
  actualSalary: number;
  employmentType: string;
  startDate: string;
  endDate: string;
  signedDate: string;
  status: string;
}
