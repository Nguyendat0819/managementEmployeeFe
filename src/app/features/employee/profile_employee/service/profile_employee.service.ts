import { Injectable } from '@angular/core';
import { EmployeeContract, EmployeeProfile } from '../model/profile_employee.model';

@Injectable({ providedIn: 'root' })
export class ProfileEmployeeService {
  readonly profile: EmployeeProfile = {
    employeeCode: 'NV-000128',
    fullName: 'Nguyễn Minh Anh',
    preferredName: 'Minh Anh',
    birthDate: '12/08/1995',
    gender: 'Nữ',
    idCard: '001095012345',
    phone: '0901 234 567',
    email: 'minhanh@employee.vn',
    address: 'Quận Cầu Giấy, Hà Nội',
    department: 'Phòng Công nghệ thông tin',
    position: 'Chuyên viên phát triển phần mềm',
    employmentType: 'Toàn thời gian',
    hireDate: '04/03/2022',
    status: 'Đang làm việc',
  };

  readonly contract: EmployeeContract = {
    contractNo: 'HDLD-2024-0128',
    contractType: 'Hợp đồng lao động không xác định thời hạn',
    startDate: '01/01/2024',
    endDate: 'Không xác định thời hạn',
    signedDate: '28/12/2023',
    salary: '25.000.000 VNĐ / tháng',
    department: 'Phòng Công nghệ thông tin',
    position: 'Chuyên viên phát triển phần mềm',
    status: 'Đang hiệu lực',
    statusType: 'success',
  };
}
