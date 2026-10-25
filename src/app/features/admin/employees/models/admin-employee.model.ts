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
  positionSalaryMin: number | null;
  positionSalaryMax: number | null;
  employmentType: string;
  hireDate: string;
  contractEnd: string | null;
  status: string;
  isDeleted: boolean;
}

export interface EmployeeRequest {
  userId: number | null;
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

export interface EmployeeUserOption {
  id: number;
  userName: string;
}

export interface EmployeeCatalogResponse {
  genders: string[];
  employmentTypes: string[];
  statuses: string[];
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

export interface EmployeeContractResponse {
  id: number;
  contractNo: string;
  contractType: string;
  employeeCode: string;
  fullName: string;
  birthDate: string | null;
  idCard: string | null;
  departmentCode: string | null;
  departmentName: string | null;
  positionCode: string | null;
  positionName: string | null;
  actualSalary: number;
  employmentType: string;
  hireDate: string | null;
  startDate: string;
  endDate: string | null;
  signedDate: string | null;
  status: string;
  isDeleted: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface EmployeeContractRequest {
  contractNo: string;
  contractType: string;
  employeeCode: string;
  actualSalary: number;
  employmentType: string;
  startDate: string;
  endDate: string | null;
  signedDate: string | null;
  status: string;
}
