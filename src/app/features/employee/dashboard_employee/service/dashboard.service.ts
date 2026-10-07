import { Injectable } from '@angular/core';
import { DashboardAnnouncement, DashboardQuickAction } from '../model/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  readonly quickActions: DashboardQuickAction[] = [
    { label: 'Đăng ký nghỉ phép', description: 'Tạo đơn nghỉ phép mới', icon: 'calendar', path: '/user/leaves' },
    { label: 'Xem phiếu lương', description: 'Kiểm tra kỳ lương gần nhất', icon: 'file-text', path: '/user/payslips' },
    { label: 'Cập nhật hồ sơ', description: 'Quản lý thông tin cá nhân', icon: 'idcard', path: '/user/profile' },
  ];

  readonly announcements: DashboardAnnouncement[] = [
    { title: 'Khảo sát mức độ hài lòng nhân viên', date: 'Hôm nay', status: 'Mới', statusType: 'info' },
    { title: 'Lịch nghỉ lễ Quốc khánh đã được cập nhật', date: '02/09/2025', status: 'Đã đọc', statusType: 'default' },
    { title: 'Nhắc nhở hoàn thành đào tạo an toàn thông tin', date: '30/08/2025', status: 'Quan trọng', statusType: 'warning' },
  ];
}
