import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EmployeeResponse } from '../../employees/models/admin-employee.model';
import { AdminEmployeeService } from '../../employees/services/admin-employee.service';
import { SsButtonComponent, SsCardComponent, SsToastService } from '@platform/ui-kit';
import { AdminNotificationService } from '../services/admin-notification.service';

@Component({
  selector: 'app-admin-notification-page',
  standalone: true,
  imports: [CommonModule, FormsModule, SsButtonComponent, SsCardComponent],
  templateUrl: './admin-notification-page.component.html',
  styleUrl: './admin-notification-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminNotificationPageComponent {
  private readonly employeeService = inject(AdminEmployeeService);
  private readonly notificationService = inject(AdminNotificationService);
  private readonly toast = inject(SsToastService);

  readonly employees = signal<EmployeeResponse[]>([]);
  readonly loadingEmployees = signal(false);
  readonly sending = signal(false);
  readonly selectedEmployee = computed(() => this.employees().find((employee) => employee.user === this.form.userId) ?? null);
  readonly form = {
    userId: null as number | null,
    title: '',
    content: '',
    category: 'Thông tin chung',
    type: 'info' as 'info' | 'success' | 'warning' | 'default',
  };

  constructor() {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loadingEmployees.set(true);
    this.employeeService.getEmployees().subscribe({
      next: ({ data }) => {
        this.employees.set((data ?? []).filter((employee) => employee.user !== null && !employee.isDeleted));
        if (!this.form.userId) this.form.userId = this.employees()[0]?.user ?? null;
      },
      error: () => this.loadingEmployees.set(false),
      complete: () => this.loadingEmployees.set(false),
    });
  }

  sendNotification(formValid: boolean): void {
    const title = this.form.title.trim();
    const content = this.form.content.trim();
    if (!formValid || !this.form.userId || !title || !content) return;

    this.sending.set(true);
    this.notificationService.send({
      userId: this.form.userId,
      channel: 'IN_APP',
      title,
      content,
      category: this.form.category.trim() || 'Thông tin chung',
      type: this.form.type,
      icon: this.form.type === 'warning' ? 'exclamation-circle' : this.form.type === 'success' ? 'check-circle' : 'bell',
    }).subscribe({
      next: () => {
        const recipient = this.selectedEmployee()?.fullName ?? 'nhân viên';
        this.form.title = '';
        this.form.content = '';
        this.toast.show({ severity: 'success', summary: 'Đã gửi thông báo', detail: `Thông báo đã được gửi đến ${recipient}.` });
      },
      error: () => this.sending.set(false),
      complete: () => this.sending.set(false),
    });
  }
}
