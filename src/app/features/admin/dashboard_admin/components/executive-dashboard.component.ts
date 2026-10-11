import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  SsButtonComponent,
  SsCardComponent,
  SsStatComponent,
  SsTagComponent,
} from '@platform/ui-kit';
import { NzIconModule } from 'ng-zorro-antd/icon';

interface HrQuickAction {
  label: string;
  description: string;
  icon: string;
  path: string;
  tone: string;
}

interface HrAlert {
  title: string;
  description: string;
  status: 'warning' | 'info' | 'success';
  statusLabel: string;
  icon: string;
}

@Component({
  selector: 'app-executive-dashboard',
  standalone: true,
  imports: [CommonModule, NzIconModule, SsButtonComponent, SsCardComponent, SsStatComponent, SsTagComponent],
  templateUrl: './executive-dashboard.component.html',
  styleUrl: './executive-dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExecutiveDashboardComponent {
  private readonly router = inject(Router);

  readonly currentPeriod = 'Tháng 09/2025';
  readonly lastUpdated = 'Cập nhật lúc 08:45 hôm nay';

  readonly departmentStats = [
    { name: 'Kỹ thuật & Sản phẩm', count: 86, percentage: 35, color: '#1677ff' },
    { name: 'Kinh doanh', count: 58, percentage: 24, color: '#13c2c2' },
    { name: 'Vận hành', count: 42, percentage: 17, color: '#722ed1' },
    { name: 'Tài chính - Kế toán', count: 31, percentage: 13, color: '#fa8c16' },
    { name: 'Khối hỗ trợ', count: 31, percentage: 13, color: '#52c41a' },
  ];

  readonly attendanceTrend = [
    { label: 'T2', value: 93 },
    { label: 'T3', value: 97 },
    { label: 'T4', value: 95 },
    { label: 'T5', value: 91 },
    { label: 'T6', value: 96 },
    { label: 'T7', value: 88 },
    { label: 'CN', value: 74 },
  ];

  readonly alerts: HrAlert[] = [
    {
      title: '12 đơn nghỉ phép chờ duyệt',
      description: 'Cần xử lý trước kỳ chốt công ngày 25/09.',
      status: 'warning',
      statusLabel: 'Cần xử lý',
      icon: 'audit',
    },
    {
      title: '03 hợp đồng sắp hết hạn',
      description: 'Trong vòng 30 ngày tới cần được rà soát.',
      status: 'info',
      statusLabel: 'Sắp đến hạn',
      icon: 'file-text',
    },
    {
      title: 'Tỷ lệ hiện diện đạt mục tiêu',
      description: 'Tăng 2.4% so với cùng kỳ tháng trước.',
      status: 'success',
      statusLabel: 'Tích cực',
      icon: 'rise',
    },
  ];

  readonly quickActions: HrQuickAction[] = [
    {
      label: 'Thêm nhân viên',
      description: 'Tạo hồ sơ nhân sự mới',
      icon: 'user-add',
      path: '/admin/employees',
      tone: 'blue',
    },
    {
      label: 'Duyệt đơn nghỉ phép',
      description: 'Xử lý các đơn đang chờ',
      icon: 'check-circle',
      path: '/admin/leaves',
      tone: 'purple',
    },
    {
      label: 'Quản lý chấm công',
      description: 'Theo dõi công và ca làm',
      icon: 'calendar',
      path: '/admin/attendance',
      tone: 'orange',
    },
    {
      label: 'Kỳ tính lương',
      description: 'Kiểm tra tiến độ payroll',
      icon: 'calculator',
      path: '/admin/payroll-runs',
      tone: 'green',
    },
  ];

  open(path: string): void {
    void this.router.navigateByUrl(path);
  }
}
