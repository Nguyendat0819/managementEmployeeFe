import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { SsButtonComponent, SsDataTableComponent, SsDialogComponent, SsDtColumn, SsDtConfig, SsStatComponent, SsTagComponent } from '@platform/ui-kit';
import { EmployeeNotification } from '../model/notification_employee.model';
import { NotificationEmployeeService } from '../service/notification_employee.service';

@Component({
  selector: 'app-notification-employee',
  standalone: true,
  imports: [CommonModule, SsButtonComponent, SsDataTableComponent, SsDialogComponent, SsStatComponent, SsTagComponent],
  templateUrl: './notification_employee.component.html',
  styleUrl: './notification_employee.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationEmployeeComponent {
  private readonly notificationService = inject(NotificationEmployeeService);

  readonly notifications = signal(this.notificationService.notifications);
  readonly unreadCount = computed(() => this.notifications().filter((item) => !item.read).length);
  readonly selectedNotification = signal<EmployeeNotification | null>(null);
  readonly detailVisible = signal(false);
  readonly notificationColumns: SsDtColumn<EmployeeNotification>[] = [
    { key: 'title', header: 'Tiêu đề', field: 'title', filterable: true, width: '32%' },
    { key: 'content', header: 'Nội dung', field: 'content', width: '34%' },
    { key: 'category', header: 'Loại thông báo', field: 'category', filterable: true, width: '150px' },
    { key: 'createdAt', header: 'Thời gian', field: 'createdAt', sortable: true, width: '130px' },
    { key: 'readStatus', header: 'Trạng thái', format: (row) => row.read ? 'Đã đọc' : 'Chưa đọc', filterable: true, width: '120px' },
  ];
  readonly notificationTableSettings: SsDtConfig<EmployeeNotification> = {
    rowKey: 'id',
    title: 'Thông báo của tôi',
    description: 'Các cập nhật và nhắc nhở mới nhất',
    cardIcon: 'bell',
    primaryButtons: [{ key: 'mark-all-read', label: 'Đánh dấu tất cả đã đọc', type: 'secondary', icon: 'check' }],
    searchable: true,
    searchPlaceholder: 'Tìm theo tiêu đề, nội dung hoặc loại thông báo',
    showSort: true,
    showFilter: true,
    showSetting: true,
    showPagination: true,
    pageSize: 5,
    pageSizeOptions: [5, 10, 20],
    striped: true,
    size: 'small',
    scrollY: '360px',
    emptyText: 'Không có thông báo',
  };

  openDetail(notification: EmployeeNotification): void {
    this.markAsRead(notification);
    this.selectedNotification.set(notification);
    this.detailVisible.set(true);
  }

  closeDetail(): void {
    this.detailVisible.set(false);
  }

  markAsRead(notification: EmployeeNotification): void {
    if (notification.read) return;
    this.notifications.update((items) => items.map((item) => item.id === notification.id ? { ...item, read: true } : item));
  }

  markAllAsRead(): void {
    this.notifications.update((items) => items.map((item) => ({ ...item, read: true })));
  }
}
