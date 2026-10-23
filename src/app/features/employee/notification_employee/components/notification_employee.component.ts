import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { SsButtonComponent, SsDataTableComponent, SsDialogComponent, SsDtColumn, SsDtConfig, SsStatComponent, SsTagComponent, SsToastService } from '@platform/ui-kit';
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
  private readonly toast = inject(SsToastService);

  readonly notifications = signal<EmployeeNotification[]>([]);
  readonly loading = signal(false);
  readonly unreadCount = signal(0);
  readonly recentCount = computed(() => {
    const weekAgo = Date.now() - 7 * 86400000;
    return this.notifications().filter((item) => item.createdAtIso && new Date(item.createdAtIso).getTime() >= weekAgo).length;
  });
  readonly importantCount = computed(() => this.notifications().filter((item) => item.type === 'warning').length);
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

  constructor() {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading.set(true);
    forkJoin({
      notifications: this.notificationService.getMine(),
      unreadCount: this.notificationService.getUnreadCount(),
    }).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: ({ notifications, unreadCount }) => {
        this.notifications.set(notifications);
        this.unreadCount.set(unreadCount);
      },
      error: () => {
        this.notifications.set([]);
        this.unreadCount.set(0);
      },
    });
  }

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
    this.notificationService.markAsRead(notification.id).subscribe((updated) => {
      this.notifications.update((items) => items.map((item) => item.id === updated.id ? updated : item));
      this.unreadCount.update((count) => Math.max(0, count - 1));
    }, () => undefined);
  }

  markAllAsRead(): void {
    if (!this.unreadCount()) return;
    this.notificationService.markAllAsRead().subscribe(() => {
      this.notifications.update((items) => items.map((item) => ({ ...item, read: true })));
      this.unreadCount.set(0);
      this.toast.show({ severity: 'success', summary: 'Đã cập nhật thông báo', detail: 'Tất cả thông báo đã được đánh dấu là đã đọc.' });
    }, () => undefined);
  }
}
