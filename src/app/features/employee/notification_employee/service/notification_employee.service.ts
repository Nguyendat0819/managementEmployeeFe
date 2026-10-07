import { Injectable } from '@angular/core';
import { EmployeeNotification } from '../model/notification_employee.model';

@Injectable({ providedIn: 'root' })
export class NotificationEmployeeService {
  readonly notifications: EmployeeNotification[] = [
    { id: 1, title: 'Khảo sát mức độ hài lòng nhân viên', content: 'Hãy chia sẻ ý kiến của bạn về môi trường làm việc trong quý III/2025.', category: 'Khảo sát', createdAt: '10 phút trước', icon: 'solution', type: 'info', read: false },
    { id: 2, title: 'Phiếu lương tháng 09/2025 đã sẵn sàng', content: 'Bạn có thể xem và tải phiếu lương điện tử trong mục Phiếu lương.', category: 'Tiền lương', createdAt: 'Hôm qua', icon: 'file-done', type: 'success', read: false },
    { id: 3, title: 'Lịch nghỉ lễ Quốc khánh đã được cập nhật', content: 'Lịch nghỉ lễ Quốc khánh 02/09 đã được cập nhật trên hệ thống.', category: 'Thông tin chung', createdAt: '02/09/2025', icon: 'calendar', type: 'default', read: true },
    { id: 4, title: 'Nhắc nhở hoàn thành đào tạo an toàn thông tin', content: 'Vui lòng hoàn thành khóa đào tạo trước ngày 15/09/2025.', category: 'Đào tạo', createdAt: '30/08/2025', icon: 'read', type: 'warning', read: false },
    { id: 5, title: 'Đơn nghỉ phép đã được phê duyệt', content: 'Đơn nghỉ phép từ ngày 18/08 đến 19/08/2025 của bạn đã được phê duyệt.', category: 'Nghỉ phép', createdAt: '15/08/2025', icon: 'check-circle', type: 'success', read: true },
  ];
}
