import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SsButtonComponent, SsCardComponent, SsCardFooterStartDirective, SsDataTableComponent, SsDialogComponent, SsDtColumn, SsDtConfig, SsStatComponent, SsToastService } from '@platform/ui-kit';
import { LeaveRequest } from '../model/leave_employee.model';
import { LeaveEmployeeService } from '../service/leave_employee.service';

@Component({
  selector: 'app-leave-employee',
  standalone: true,
  imports: [CommonModule, FormsModule, SsButtonComponent, SsCardComponent, SsCardFooterStartDirective, SsDataTableComponent, SsDialogComponent, SsStatComponent],
  templateUrl: './leave_employee.component.html',
  styleUrl: './leave_employee.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaveEmployeeComponent {
  private readonly leaveService = inject(LeaveEmployeeService);
  private readonly toast = inject(SsToastService);

  readonly balances = this.leaveService.balances;
  readonly requests = signal(this.leaveService.requests);
  readonly totalRemaining = this.balances.reduce((total, balance) => total + balance.total - balance.used, 0);
  readonly dialogVisible = signal(false);
  readonly leaveForm = { type: 'Phép năm', startDate: '', endDate: '', reason: '' };
  readonly leaveColumns: SsDtColumn<LeaveRequest>[] = [
    { key: 'type', header: 'Loại phép', field: 'type', filterable: true },
    { key: 'period', header: 'Thời gian nghỉ', format: (row) => row.startDate + ' - ' + row.endDate, sortable: true },
    { key: 'days', header: 'Số ngày', field: 'days', align: 'center', width: '110px' },
    { key: 'reason', header: 'Lý do', field: 'reason' },
    { key: 'status', header: 'Trạng thái', field: 'status', filterable: true, width: '140px' },
  ];
  readonly leaveTableSettings: SsDtConfig<LeaveRequest> = {
    rowKey: (row) => row.startDate + row.type,
    title: 'Đơn nghỉ phép gần đây',
    description: 'Lịch sử đăng ký nghỉ phép',
    cardIcon: 'file-text',
    primaryButtons: [{ key: 'create-leave', label: 'Tạo đơn nghỉ phép', type: 'primary', icon: 'plus' }],
    searchable: true,
    searchPlaceholder: 'Tìm theo loại phép, lý do hoặc trạng thái',
    showSort: true,
    showFilter: true,
    showSetting: true,
    showPagination: true,
    pageSize: 5,
    pageSizeOptions: [5, 10, 20],
    striped: true,
    size: 'small',
    scrollY: '280px',
    emptyText: 'Chưa có đơn nghỉ phép',
  };

  openRequestDialog(): void {
    this.leaveForm.type = 'Phép năm';
    this.leaveForm.startDate = '';
    this.leaveForm.endDate = '';
    this.leaveForm.reason = '';
    this.dialogVisible.set(true);
  }

  closeRequestDialog(): void {
    this.dialogVisible.set(false);
  }

  submitRequest(): void {
    if (!this.leaveForm.startDate || !this.leaveForm.endDate || !this.leaveForm.reason.trim()) {
      this.toast.show({ severity: 'warning', summary: 'Chưa đủ thông tin', detail: 'Vui lòng nhập đầy đủ thời gian nghỉ và lý do.' });
      return;
    }
    if (this.leaveForm.endDate < this.leaveForm.startDate) {
      this.toast.show({ severity: 'warning', summary: 'Thời gian không hợp lệ', detail: 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.' });
      return;
    }
    const request: LeaveRequest = {
      type: this.leaveForm.type,
      startDate: this.formatDate(this.leaveForm.startDate),
      endDate: this.formatDate(this.leaveForm.endDate),
      days: this.calculateDays(this.leaveForm.startDate, this.leaveForm.endDate) + ' ngày',
      reason: this.leaveForm.reason.trim(),
      status: 'Chờ duyệt',
      statusType: 'warning',
    };
    this.requests.update((items) => [request, ...items]);
    this.closeRequestDialog();
    this.toast.show({ severity: 'success', summary: 'Gửi đơn thành công', detail: 'Đơn nghỉ phép đã được gửi đến người phê duyệt.' });
  }

  private calculateDays(start: string, end: string): number {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.floor((endDate.getTime() - startDate.getTime()) / 86400000) + 1;
  }

  private formatDate(value: string): string {
    const [year, month, day] = value.split('-');
    return day + '/' + month + '/' + year;
  }
}
