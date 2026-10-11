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
  position: string;
  employmentType: string;
  hireDate: string;
  contractEnd: string;
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
