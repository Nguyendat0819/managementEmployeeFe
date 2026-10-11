import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { SsButtonComponent, SsCardComponent, SsConfirmService, SsDataTableComponent, SsDialogComponent, SsDtActionClick, SsDtButton, SsDtColumn, SsDtConfig, SsStatComponent, SsTagComponent, SsToastService } from '@platform/ui-kit';
import { AdminLeaveRequest, AdminLeaveRequestStatus } from '../../models/admin-leave-request.model';
import { AdminLeaveRequestService } from '../../services/admin-leave-request.service';

interface LeaveDecisionForm {
  reason: string;
}

@Component({
  selector: 'app-admin-leave-approval',
  standalone: true,
  imports: [CommonModule, FormsModule, NzIconModule, SsButtonComponent, SsCardComponent, SsDataTableComponent, SsDialogComponent, SsStatComponent, SsTagComponent],
  templateUrl: './admin-leave-approval.component.html',
  styleUrl: './admin-leave-approval.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLeaveApprovalComponent {
  private readonly leaveService = inject(AdminLeaveRequestService);
  private readonly confirmService = inject(SsConfirmService);
  private readonly toast = inject(SsToastService);

  readonly requests = signal(this.leaveService.requests);
  readonly selectedRequest = signal<AdminLeaveRequest | null>(null);
  readonly detailVisible = signal(false);
  readonly rejectVisible = signal(false);
  readonly rejectForm: LeaveDecisionForm = { reason: '' };
  readonly approvalPeriod = 'Tháng 10/2025';
  readonly lastUpdated = 'Cập nhật lúc 08:45 hôm nay';

  readonly reviewQueue = [
    { label: 'Cần xử lý trong hôm nay', value: 4, caption: 'Đơn bắt đầu nghỉ trước 14/10', tone: 'urgent', icon: 'clock-circle' },
    { label: 'Đơn phép năm', value: 2, caption: 'Ưu tiên rà soát lịch bàn giao', tone: 'annual', icon: 'calendar' },
    { label: 'Đơn có hồ sơ đính kèm', value: 1, caption: 'Cần mở chi tiết để kiểm tra', tone: 'document', icon: 'paper-clip' },
  ];

  readonly approvalFlow = [
    { label: 'Đã tiếp nhận', value: 8, percentage: 100, color: '#4d8dff' },
    { label: 'Đang chờ duyệt', value: 4, percentage: 50, color: '#f59f3d' },
    { label: 'Đã xử lý', value: 4, percentage: 50, color: '#32b36b' },
  ];

  readonly leaveColumns: SsDtColumn<AdminLeaveRequest>[] = [
    { key: 'requestCode', header: 'Mã đơn', field: 'requestCode', width: '135px', sortable: true, filterable: true },
    { key: 'employeeName', header: 'Nhân viên', field: 'employeeName', width: '190px', sortable: true, filterable: true },
    { key: 'department', header: 'Phòng ban', field: 'department', width: '170px', filterable: true },
    { key: 'type', header: 'Loại phép', field: 'type', width: '145px', filterable: true },
    { key: 'period', header: 'Thời gian nghỉ', format: (row) => row.startDate === row.endDate ? row.startDate : `${row.startDate} - ${row.endDate}`, width: '220px', sortable: true },
    { key: 'days', header: 'Số ngày', format: (row) => `${row.days} ngày`, width: '95px', align: 'center', sortable: true },
    { key: 'submittedAt', header: 'Ngày gửi', field: 'submittedAt', width: '145px', sortable: true },
    {
      key: 'status',
      header: 'Trạng thái',
      field: 'status',
      type: 'status',
      width: '130px',
      options: [
        { label: 'Chờ duyệt', value: 'Chờ duyệt', color: '#f59f3d' },
        { label: 'Đã duyệt', value: 'Đã duyệt', color: '#32b36b' },
        { label: 'Từ chối', value: 'Từ chối', color: '#ff6b6b' },
        { label: 'Đã hủy', value: 'Đã hủy', color: '#7d8da6' },
      ],
    },
  ];

  leaveTableSettings: SsDtConfig<AdminLeaveRequest> = {
    rowKey: 'id',
    title: 'Hàng đợi duyệt đơn',
    description: 'Tập trung các yêu cầu nghỉ phép của toàn bộ nhân sự',
    cardIcon: 'audit',
    cardStatusLabel: `${this.pendingCount} đơn chờ duyệt`,
    cardStatusType: 'warning',
    primaryButtons: [
      { key: 'refresh', label: 'Làm mới', type: 'secondary', icon: 'reload' },
    ],
    searchable: true,
    searchPlaceholder: 'Tìm theo mã đơn, tên nhân viên hoặc lý do',
    showSort: true,
    showFilter: true,
    showSetting: true,
    showPagination: true,
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    rowActions: [
      { key: 'detail', label: 'Xem chi tiết', icon: 'eye' },
      { key: 'approve', label: 'Duyệt đơn', icon: 'check', visible: (row) => row.status === 'Chờ duyệt' },
      { key: 'reject', label: 'Từ chối', icon: 'close', danger: true, visible: (row) => row.status === 'Chờ duyệt' },
    ],
    quickFilters: [
      {
        key: 'status',
        placeholder: 'Tất cả trạng thái',
        options: [
          { label: 'Chờ duyệt', value: 'Chờ duyệt' },
          { label: 'Đã duyệt', value: 'Đã duyệt' },
          { label: 'Từ chối', value: 'Từ chối' },
          { label: 'Đã hủy', value: 'Đã hủy' },
        ],
      },
      {
        key: 'type',
        placeholder: 'Tất cả loại phép',
        options: [
          { label: 'Phép năm', value: 'Phép năm' },
          { label: 'Phép ốm', value: 'Phép ốm' },
          { label: 'Phép đặc biệt', value: 'Phép đặc biệt' },
          { label: 'Phép không lương', value: 'Phép không lương' },
        ],
      },
    ],
    rowClass: (row) => row.status === 'Chờ duyệt' ? 'pending-leave-row' : '',
    striped: true,
    size: 'small',
    scrollX: '1250px',
    emptyText: 'Không có đơn nghỉ phép phù hợp',
  };

  get pendingCount(): number {
    return this.requests().filter((request) => request.status === 'Chờ duyệt').length;
  }

  get pendingDays(): number {
    return this.requests().filter((request) => request.status === 'Chờ duyệt').reduce((total, request) => total + request.days, 0);
  }

  get approvedCount(): number {
    return this.requests().filter((request) => request.status === 'Đã duyệt').length;
  }

  get rejectedCount(): number {
    return this.requests().filter((request) => request.status === 'Từ chối').length;
  }

  get queueProgress(): number {
    return Math.min(this.pendingCount * 8, 100);
  }

  onPrimaryClick(button: SsDtButton): void {
    if (button.key === 'refresh') {
      this.toast.show({ severity: 'success', summary: 'Đã làm mới danh sách', detail: 'Hàng đợi duyệt đơn đang hiển thị dữ liệu mới nhất.' });
      return;
    }
    if (button.key === 'export') {
      this.toast.show({ severity: 'info', summary: 'Đang chuẩn bị danh sách', detail: `Báo cáo ${this.approvalPeriod} sẽ sẵn sàng trong ít phút.` });
    }
  }

  onActionClick(event: SsDtActionClick<AdminLeaveRequest>): void {
    if (event.action.key === 'detail') {
      this.selectedRequest.set(event.row);
      this.detailVisible.set(true);
      return;
    }
    if (event.action.key === 'approve') {
      void this.approveRequest(event.row);
      return;
    }
    if (event.action.key === 'reject') this.openRejectDialog(event.row);
  }

  openRejectDialog(request: AdminLeaveRequest): void {
    this.selectedRequest.set(request);
    this.rejectForm.reason = '';
    this.rejectVisible.set(true);
  }

  closeDetail(): void {
    this.detailVisible.set(false);
  }

  closeRejectDialog(): void {
    this.rejectVisible.set(false);
  }

  async approveRequest(request: AdminLeaveRequest): Promise<void> {
    const confirmed = await this.confirmService.confirm(
      'Xác nhận duyệt đơn nghỉ phép',
      `Bạn có chắc muốn duyệt đơn ${request.requestCode} của ${request.employeeName} không?`,
      { type: 'warning', okText: 'Duyệt đơn' },
    );
    if (!confirmed) return;
    this.updateRequest(request, { status: 'Đã duyệt', processedAt: '07/10/2025 08:50', approver: 'Quản trị viên', decisionNote: 'Đơn đã được phê duyệt.' });
    this.toast.show({ severity: 'success', summary: 'Duyệt đơn thành công', detail: `${request.employeeName} đã được ghi nhận lịch nghỉ.` });
  }

  saveRejection(formValid: boolean): void {
    const request = this.selectedRequest();
    const reason = this.rejectForm.reason.trim();
    if (!request || !formValid || !reason) return;
    this.updateRequest(request, { status: 'Từ chối', processedAt: '07/10/2025 08:50', approver: 'Quản trị viên', decisionNote: reason });
    this.closeRejectDialog();
    this.toast.show({ severity: 'success', summary: 'Đã từ chối đơn', detail: `Đơn ${request.requestCode} đã được cập nhật trạng thái.` });
  }

  statusTone(status: AdminLeaveRequestStatus): 'success' | 'warning' | 'error' | 'info' {
    if (status === 'Đã duyệt') return 'success';
    if (status === 'Chờ duyệt') return 'warning';
    if (status === 'Từ chối') return 'error';
    return 'info';
  }

  initials(name: string): string {
    return name.split(' ').slice(-2).map((part) => part[0]).join('');
  }

  private updateRequest(request: AdminLeaveRequest, changes: Partial<AdminLeaveRequest>): void {
    const updatedRequest = { ...request, ...changes };
    this.requests.update((requests) => requests.map((item) => item.id === request.id ? updatedRequest : item));
    this.leaveTableSettings = { ...this.leaveTableSettings, cardStatusLabel: `${this.pendingCount} đơn chờ duyệt` };
    this.selectedRequest.set(updatedRequest);
  }
}
