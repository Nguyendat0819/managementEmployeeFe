import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoint';
import { ApiResponse } from '@core/models/api-response.interface';
import { BaseService } from '@core/services/base.service';
import { EmployeeContract, EmployeeContractResponse, EmployeeProfile, EmployeeProfileResponse } from '../model/profile_employee.model';

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
    contractNo: 'Đang tải...',
    contractType: 'Đang tải...',
    startDate: '—',
    endDate: '—',
    signedDate: '—',
    salary: '—',
    department: '—',
    position: '—',
    status: 'Đang tải...',
    statusType: 'default',
  };

  getCurrentProfile(): Observable<ApiResponse<EmployeeProfileResponse>> {
    return this.get<ApiResponse<EmployeeProfileResponse>>(API_ENDPOINTS.Employee.MEPROFILE, API_ENDPOINTS.Employee.BASE);
  }

  getCurrentContract(): Observable<ApiResponse<EmployeeContractResponse | null>> {
    return this.get<ApiResponse<EmployeeContractResponse | null>>(API_ENDPOINTS.EmployeeContract.CONTRACTME, API_ENDPOINTS.EmployeeContract.BASE);
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
  }

  markProfileUnavailable(): void {
    Object.assign(this.profile, {
      employeeCode: 'Chưa có hồ sơ',
      fullName: 'Chưa có hồ sơ nhân viên',
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
    });
  }

  applyContractResponse(response: EmployeeContractResponse | null): void {
    if (!response) {
      Object.assign(this.contract, {
        contractNo: 'Chưa có hợp đồng hiện tại',
        contractType: 'Chưa cập nhật',
        startDate: '—',
        endDate: '—',
        signedDate: '—',
        salary: '—',
        department: '—',
        position: '—',
        status: 'Không có dữ liệu',
        statusType: 'default',
      });
      return;
    }

    Object.assign(this.contract, {
      contractNo: response.contractNo,
      contractType: response.contractType,
      startDate: this.formatDate(response.startDate),
      endDate: response.endDate ? this.formatDate(response.endDate) : 'Không xác định thời hạn',
      signedDate: this.formatDate(response.signedDate),
      salary: `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(response.actualSalary ?? 0)} VNĐ / tháng`,
      department: response.departmentName ?? 'Chưa cập nhật',
      position: response.positionName ?? 'Chưa cập nhật',
      status: response.status,
      statusType: response.status === 'Đang hiệu lực' ? 'success' : response.status === 'Sắp hết hạn' ? 'warning' : 'default',
    });
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
