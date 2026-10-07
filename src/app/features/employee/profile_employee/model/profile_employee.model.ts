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
