import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoint';
import { ApiResponse } from '@core/models/api-response.interface';
import { BaseService } from '@core/services/base.service';
import { EmployeeContract, EmployeeProfile, EmployeeProfileResponse } from '../model/profile_employee.model';

@Injectable({ providedIn: 'root' })
export class ProfileEmployeeService extends BaseService {
  readonly profile: EmployeeProfile = {
    employeeCode: 'Đang tải...',
    fullName: 'Đang tải...',
    preferredName: 'Chưa cập nhật',
    birthDate: 'Chưa cập nhật',
    gender: 'Chưa cập nhật',
    idCard: 'Chưa cập nhật',
    phone: 'Chưa cập nhật',
    email: 'Chưa cập nhật',
    address: 'Chưa cập nhật',
    department: 'Chưa cập nhật',
    position: 'Chưa cập nhật',
    employmentType: 'Chưa cập nhật',
    hireDate: 'Chưa cập nhật',
    status: 'Chưa cập nhật',
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

  getCurrentProfile(): Observable<ApiResponse<EmployeeProfileResponse>> {
    return this.get<ApiResponse<EmployeeProfileResponse>>(API_ENDPOINTS.Employee.MEPROFILE, API_ENDPOINTS.Employee.BASE);
  }

  applyResponse(response: EmployeeProfileResponse): void {
    const nameParts = response.fullName.trim().split(/\s+/);
    Object.assign(this.profile, {
      employeeCode: response.employeeCode,
      fullName: response.fullName,
      preferredName: nameParts.slice(-2).join(' '),
      birthDate: this.formatDate(response.birthDate),
      gender: response.gender ?? 'Chưa cập nhật',
      idCard: response.idCard ?? 'Chưa cập nhật',
      phone: response.phone ?? 'Chưa cập nhật',
      email: response.email ?? 'Chưa cập nhật',
      department: response.departmentName ?? response.departmentCode ?? 'Chưa cập nhật',
      position: response.positionName ?? response.positionCode ?? 'Chưa cập nhật',
      employmentType: response.employmentType,
      hireDate: this.formatDate(response.hireDate),
      status: response.status,
    });
    this.contract.department = this.profile.department;
    this.contract.position = this.profile.position;
  }

  private formatDate(value: string | null): string {
    if (!value) return 'Chưa cập nhật';
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    }).format(date);
  }
}
