import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { SsButtonComponent, SsCardComponent, SsCardFooterStartDirective, SsConfirmService, SsDataTableComponent, SsDatepickerComponent, SsDialogComponent, SsDtActionClick, SsDtColumn, SsDtConfig, SsSelectComponent, SsStatComponent, SsToastService } from '@platform/ui-kit';
import { LeaveApiService } from '@core/services/leave-api.service';
import { LeaveBalanceDto, LeaveHolidayDto, LeaveRequestDto, LeaveTypeDto } from '@core/models/leave-api.model';
import { LeaveRequest } from '../model/leave_employee.model';

@Component({
  selector: 'app-leave-employee',
  standalone: true,
  imports: [CommonModule, FormsModule, SsButtonComponent, SsCardComponent, SsCardFooterStartDirective, SsDataTableComponent, SsDatepickerComponent, SsDialogComponent, SsSelectComponent, SsStatComponent],
  templateUrl: './leave_employee.component.html',
  styleUrl: './leave_employee.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaveEmployeeComponent {
  private readonly leaveService = inject(LeaveApiService);
  private readonly toast = inject(SsToastService);
  private readonly confirmService = inject(SsConfirmService);
  private holidayRequest?: Subscription;

  readonly balances = signal<LeaveBalanceView[]>([]);
  readonly balancesLoading = signal(false);
  readonly balancesLoadError = signal(false);
  readonly leaveTypes = signal<LeaveTypeDto[]>([]);
  readonly selectedLeaveTypeId = signal<number | null>(null);
  readonly holidayDates = signal<Set<string>>(new Set());
  readonly holidayLoading = signal(false);
  readonly holidayLoadError = signal(false);
  readonly holidayRangeKey = signal('');
  private readonly dateRangeRevision = signal(0);
  readonly startDateErrors = { required: 'Vui lòng chọn ngày bắt đầu.', invalidDate: 'Ngày bắt đầu không hợp lệ.' };
  readonly endDateErrors = { required: 'Vui lòng chọn ngày kết thúc.', invalidDate: 'Ngày kết thúc không hợp lệ.' };
  readonly leaveTypeOptions = computed(() => this.leaveTypes().map((type) => ({ label: type.name, value: type.id })));
  readonly evidenceRequired = computed(() => this.leaveTypes().find((type) => type.id === this.selectedLeaveTypeId())?.requireDocument ?? false);
  readonly validDateRange = computed(() => {
    this.dateRangeRevision();
    const start = this.parseIsoDate(this.leaveForm.startDate);
    const end = this.parseIsoDate(this.leaveForm.endDate);
    if (!start || !end || this.leaveForm.startDate > this.leaveForm.endDate) return null;
    if (start.getUTCFullYear() !== end.getUTCFullYear()) return null;
    return { start, end, key: `${this.leaveForm.startDate}|${this.leaveForm.endDate}` };
  });
  readonly dateRangeMessage = computed(() => {
    this.dateRangeRevision();
    const start = this.parseIsoDate(this.leaveForm.startDate);
    const end = this.parseIsoDate(this.leaveForm.endDate);
    if (!this.leaveForm.startDate || !this.leaveForm.endDate || !start || !end) return '';
    if (this.leaveForm.endDate < this.leaveForm.startDate) return 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.';
    if (start.getUTCFullYear() !== end.getUTCFullYear()) return 'Mỗi đơn nghỉ phép chỉ được đăng ký trong cùng một năm.';
    return '';
  });
  readonly requestedDays = computed(() => {
    const range = this.validDateRange();
    if (!range || this.holidayLoading() || this.holidayLoadError() || this.holidayRangeKey() !== range.key) return null;
    let days = 0;
    for (let timestamp = range.start.getTime(); timestamp <= range.end.getTime(); timestamp += 86_400_000) {
      const date = new Date(timestamp);
      const weekday = date.getUTCDay();
      if (weekday !== 0 && weekday !== 6 && !this.holidayDates().has(this.toIsoUtcDate(date))) days += 1;
    }
    return days;
  });
  readonly quotaPreview = computed(() => {
    const requested = this.requestedDays();
    const balance = this.balances().find((item) => item.leaveTypeId === this.selectedLeaveTypeId());
    if (requested === null || !balance) return null;
    return { ...balance, requested, exceeded: Math.max(0, requested - balance.remaining), remainingAfterRequest: balance.remaining - requested };
  });
  readonly requests = signal<LeaveRequest[]>([]);
  readonly leaveTypesLoading = signal(false);
  readonly leaveTypeLoadMessage = signal('');
  readonly submitting = signal(false);
  readonly currentYear = new Date().getFullYear();
  readonly totalRemaining = computed(() => this.balances().reduce((total, balance) => total + balance.remaining, 0));
  readonly pendingCount = computed(() => this.requests().filter((request) => request.statusCode === 'PENDING').length);
  readonly usedThisYear = computed(() => this.balances().reduce((total, balance) => total + balance.used, 0));
  readonly upcomingDays = computed(() => {
    const today = this.toIsoLocalDate(new Date());
    return this.requests()
      .filter((request) => request.statusCode === 'APPROVED' && request.startDateIso >= today)
      .reduce((total, request) => total + request.days, 0);
  });
  readonly dialogVisible = signal(false);
  readonly policyDialogVisible = signal(false);
  readonly leaveForm = { startDate: '', endDate: '', reason: '', evidenceUrl: '' };
  readonly leaveColumns: SsDtColumn<LeaveRequest>[] = [
    { key: 'type', header: 'Loại phép', field: 'type', filterable: true },
    { key: 'period', header: 'Thời gian nghỉ', format: (row) => row.startDate + ' - ' + row.endDate, sortable: true },
    { key: 'days', header: 'Số ngày', format: (row) => `${row.days} ngày`, align: 'center', width: '110px' },
    { key: 'reason', header: 'Lý do', field: 'reason' },
    { key: 'status', header: 'Trạng thái', field: 'status', filterable: true, width: '140px' },
  ];
  readonly leaveTableSettings: SsDtConfig<LeaveRequest> = {
    rowKey: 'id',
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
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    striped: true,
    size: 'small',
    scrollY: '280px',
    emptyText: 'Chưa có đơn nghỉ phép',
    rowActions: [{ key: 'cancel', label: 'Hủy đơn', icon: 'close', danger: true, visible: (row) => row.statusCode === 'PENDING' }],
  };

  constructor() {
    this.loadLeaveData();
  }

  loadLeaveData(): void {
    this.leaveService.getMyRequests().subscribe({
      next: (requests) => this.requests.set(requests.map((item) => this.toLeaveRequest(item))),
      error: () => undefined,
    });
    this.loadBalances();
    this.loadLeaveTypes();
  }

  loadBalances(): void {
    this.balancesLoading.set(true);
    this.balancesLoadError.set(false);
    this.leaveService.getMyBalances(this.currentYear).pipe(finalize(() => this.balancesLoading.set(false))).subscribe({
      next: (balances) => this.balances.set(balances.map((item) => this.toLeaveBalance(item))),
      error: () => this.balancesLoadError.set(true),
    });
  }

  loadLeaveTypes(): void {
    this.leaveTypesLoading.set(true);
    this.leaveTypeLoadMessage.set('');
    this.leaveService.getLeaveTypes().pipe(finalize(() => this.leaveTypesLoading.set(false))).subscribe({
      next: (leaveTypes) => {
        this.leaveTypes.set(leaveTypes);
        const selectedId = this.selectedLeaveTypeId();
        if (!leaveTypes.some((type) => type.id === selectedId)) {
          this.selectedLeaveTypeId.set(leaveTypes[0]?.id ?? null);
        }
        if (!leaveTypes.length) {
          this.leaveTypeLoadMessage.set('Chưa có loại phép đang áp dụng. Vui lòng liên hệ bộ phận nhân sự.');
        }
      },
      error: () => {
        this.leaveTypes.set([]);
        this.selectedLeaveTypeId.set(null);
        this.leaveTypeLoadMessage.set('Không tải được danh sách loại phép. Vui lòng thử lại.');
      },
    });
  }

  openRequestDialog(): void {
    this.selectedLeaveTypeId.set(this.leaveTypes()[0]?.id ?? null);
    this.leaveForm.startDate = '';
    this.leaveForm.endDate = '';
    this.dateRangeRevision.update((revision) => revision + 1);
    this.leaveForm.reason = '';
    this.leaveForm.evidenceUrl = '';
    this.clearHolidayPreview();
    this.dialogVisible.set(true);
  }

  onLeaveTypeChange(value: unknown): void {
    this.selectedLeaveTypeId.set(typeof value === 'number' ? value : null);
  }

  onStartDateChange(value: unknown): void {
    this.leaveForm.startDate = typeof value === 'string' ? value : '';
    this.dateRangeRevision.update((revision) => revision + 1);
    this.updateHolidayPreview();
  }

  onEndDateChange(value: unknown): void {
    this.leaveForm.endDate = typeof value === 'string' ? value : '';
    this.dateRangeRevision.update((revision) => revision + 1);
    this.updateHolidayPreview();
  }

  balancePercent(balance: LeaveBalanceView): number {
    return balance.total > 0 ? Math.max(0, Math.min(100, (balance.remaining / balance.total) * 100)) : 0;
  }

  closeRequestDialog(): void {
    this.dialogVisible.set(false);
    this.clearHolidayPreview();
  }

  retryHolidayPreview(): void {
    this.updateHolidayPreview(true);
  }

  openPolicyDialog(): void {
    this.policyDialogVisible.set(true);
  }

  submitRequest(): void {
    const leaveTypeId = this.selectedLeaveTypeId();
    if (!leaveTypeId || !this.leaveForm.startDate || !this.leaveForm.endDate || !this.leaveForm.reason.trim()) {
      this.toast.show({ severity: 'warning', summary: 'Chưa đủ thông tin', detail: 'Vui lòng chọn loại phép, thời gian nghỉ và nhập lý do.' });
      return;
    }
    if (this.leaveForm.endDate < this.leaveForm.startDate) {
      this.toast.show({ severity: 'warning', summary: 'Thời gian không hợp lệ', detail: 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.' });
      return;
    }
    if (!this.validDateRange()) {
      this.toast.show({ severity: 'warning', summary: 'Thời gian không hợp lệ', detail: 'Mỗi đơn nghỉ phép chỉ được đăng ký trong cùng một năm và ngày phải hợp lệ.' });
      return;
    }
    const evidenceUrl = this.leaveForm.evidenceUrl.trim();
    if (this.evidenceRequired() && !evidenceUrl) {
      this.toast.show({ severity: 'warning', summary: 'Thiếu minh chứng', detail: 'Loại phép đã chọn yêu cầu đường dẫn minh chứng.' });
      return;
    }
    if (evidenceUrl && !this.isValidUrl(evidenceUrl)) {
      this.toast.show({ severity: 'warning', summary: 'Đường dẫn minh chứng không hợp lệ', detail: 'Vui lòng nhập một đường dẫn bắt đầu bằng http:// hoặc https://.' });
      return;
    }
    this.submitting.set(true);
    this.leaveService.createRequest({
      leaveTypeId,
      startDate: this.leaveForm.startDate,
      endDate: this.leaveForm.endDate,
      reason: this.leaveForm.reason.trim(),
      evidenceUrl: evidenceUrl || undefined,
    }).subscribe({
      next: () => {
        this.closeRequestDialog();
        this.toast.show({ severity: 'success', summary: 'Gửi đơn thành công', detail: 'Đơn nghỉ phép đã được gửi đến người phê duyệt.' });
        this.loadLeaveData();
      },
      error: () => this.submitting.set(false),
      complete: () => this.submitting.set(false),
    });
  }

  onActionClick(event: SsDtActionClick<LeaveRequest>): void {
    if (event.action.key === 'cancel') void this.cancelRequest(event.row);
  }

  private async cancelRequest(request: LeaveRequest): Promise<void> {
    const confirmed = await this.confirmService.confirm(
      'Xác nhận hủy đơn nghỉ phép',
      `Bạn có chắc muốn hủy đơn ${request.type} từ ${request.startDate} không?`,
      { type: 'warning', okText: 'Hủy đơn' },
    );
    if (!confirmed) return;
    this.leaveService.cancelRequest(request.id).subscribe((updated) => {
      this.requests.update((items) => items.map((item) => item.id === updated.id ? this.toLeaveRequest(updated) : item));
      this.toast.show({ severity: 'success', summary: 'Đã hủy đơn', detail: 'Trạng thái đơn nghỉ phép đã được cập nhật.' });
      this.loadLeaveData();
    }, () => undefined);
  }

  private toLeaveRequest(item: LeaveRequestDto): LeaveRequest {
    const status = item.status || this.statusLabel(item.statusCode);
    return {
      id: item.id,
      leaveTypeId: item.leaveTypeId,
      type: item.type,
      startDate: this.formatDate(item.startDate),
      endDate: this.formatDate(item.endDate),
      startDateIso: item.startDate,
      days: Number(item.days ?? 0),
      reason: item.reason,
      status,
      statusCode: item.statusCode,
      evidenceUrl: item.evidenceUrl ?? '',
      statusType: item.statusCode === 'APPROVED' ? 'success' : item.statusCode === 'PENDING' ? 'warning' : item.statusCode === 'REJECTED' ? 'error' : 'default',
    };
  }

  private toLeaveBalance(item: LeaveBalanceDto): LeaveBalanceView {
    return {
      leaveTypeId: item.leaveTypeId,
      label: item.label || item.type,
      used: Number(item.usedDays ?? 0),
      total: Number(item.totalDays ?? 0),
      remaining: Number(item.remainingDays ?? 0),
      pending: Number(item.pendingDays ?? 0),
      tone: 'primary',
    };
  }

  private updateHolidayPreview(force = false): void {
    const range = this.validDateRange();
    this.holidayRequest?.unsubscribe();
    this.holidayRequest = undefined;
    this.holidayLoading.set(false);
    this.holidayLoadError.set(false);
    if (!range) {
      this.holidayDates.set(new Set());
      this.holidayRangeKey.set('');
      return;
    }
    if (!force && this.holidayRangeKey() === range.key) return;

    this.holidayDates.set(new Set());
    this.holidayRangeKey.set('');
    this.holidayLoading.set(true);
    this.holidayRequest = this.leaveService.getHolidays(this.leaveForm.startDate, this.leaveForm.endDate).subscribe({
      next: (holidays) => {
        this.holidayDates.set(this.collectHolidayDates(holidays));
        this.holidayRangeKey.set(range.key);
      },
      error: () => {
        this.holidayLoadError.set(true);
        this.holidayLoading.set(false);
      },
      complete: () => this.holidayLoading.set(false),
    });
  }

  private clearHolidayPreview(): void {
    this.holidayRequest?.unsubscribe();
    this.holidayRequest = undefined;
    this.holidayDates.set(new Set());
    this.holidayRangeKey.set('');
    this.holidayLoading.set(false);
    this.holidayLoadError.set(false);
  }

  private collectHolidayDates(holidays: LeaveHolidayDto[]): Set<string> {
    const dates = new Set<string>();
    for (const holiday of holidays) {
      const start = this.parseIsoDate(holiday.startDate);
      const end = this.parseIsoDate(holiday.endDate);
      if (!start || !end) continue;
      for (let timestamp = start.getTime(); timestamp <= end.getTime(); timestamp += 86_400_000) {
        dates.add(this.toIsoUtcDate(new Date(timestamp)));
      }
    }
    return dates;
  }

  private parseIsoDate(value: string): Date | null {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? date : null;
  }

  private toIsoUtcDate(value: Date): string {
    const year = value.getUTCFullYear();
    const month = String(value.getUTCMonth() + 1).padStart(2, '0');
    const day = String(value.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private statusLabel(statusCode: string): string {
    return ({ PENDING: 'Chờ duyệt', APPROVED: 'Đã duyệt', REJECTED: 'Từ chối', CANCELLED: 'Đã hủy' } as Record<string, string>)[statusCode] ?? statusCode;
  }

  private formatDate(value: string): string {
    const [year, month, day] = value.split('-');
    return year && month && day ? `${day}/${month}/${year}` : value;
  }

  private isValidUrl(value: string): boolean {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private toIsoLocalDate(value: Date): string {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

interface LeaveBalanceView {
  leaveTypeId: number;
  label: string;
  used: number;
  total: number;
  remaining: number;
  pending: number;
  tone: 'primary' | 'success' | 'warning';
}
