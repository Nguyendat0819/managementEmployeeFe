import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  SsDataTableComponent,
  SsDialogComponent,
  SsDtActionClick,
  SsDtColumn,
  SsDtConfig,
  SsToastService,
} from '@platform/ui-kit';
import { AdminAuditLog } from '../../models/admin-audit-log.model';
import { AdminAuditLogService } from '../../services/admin-audit-log.service';

@Component({
  selector: 'app-admin-audit-log',
  standalone: true,
  imports: [CommonModule, SsDataTableComponent, SsDialogComponent],
  templateUrl: './admin-audit-log.component.html',
  styleUrl: './admin-audit-log.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAuditLogComponent {
  private readonly auditLogService = inject(AdminAuditLogService);
  private readonly toast = inject(SsToastService);

  readonly logs = signal(this.auditLogService.logs);
  readonly selectedLog = signal<AdminAuditLog | null>(null);
  readonly detailVisible = signal(false);

  get successfulCount(): number {
    return this.logs().filter((log) => log.result === 'Thành công').length;
  }

  get failedCount(): number {
    return this.logs().filter((log) => log.result === 'Thất bại').length;
  }

  get securityEventCount(): number {
    return this.logs().filter((log) => log.module === 'Xác thực').length;
  }

  readonly columns: SsDtColumn<AdminAuditLog>[] = [
    { key: 'occurredAt', header: 'Thời gian', field: 'occurredAt', width: '170px', sortable: true },
    { key: 'actor', header: 'Người thực hiện', format: (row) => `${row.actorName} · ${row.actor}`, width: '205px', sortable: true, filterable: true },
    { key: 'action', header: 'Hành động', field: 'action', width: '125px', sortable: true, filterable: true },
    { key: 'module', header: 'Phân hệ', field: 'module', width: '135px', sortable: true, filterable: true },
    { key: 'target', header: 'Đối tượng', field: 'target', width: '265px', filterable: true },
    { key: 'result', header: 'Kết quả', field: 'result', type: 'status', width: '120px', options: [{ label: 'Thành công', value: 'Thành công', color: '#32b36b' }, { label: 'Thất bại', value: 'Thất bại', color: '#ff4d4f' }] },
    { key: 'ipAddress', header: 'Địa chỉ IP', field: 'ipAddress', width: '135px' },
  ];

  readonly settings: SsDtConfig<AdminAuditLog> = {
    rowKey: 'id',
    title: 'Audit Log',
    description: 'Theo dõi lịch sử thao tác và các sự kiện bảo mật trong hệ thống',
    cardIcon: 'file-search',
    cardStatusLabel: `${this.logs().length} sự kiện`,
    cardStatusType: 'info',
    searchable: true,
    searchPlaceholder: 'Tìm theo người thực hiện, hành động, đối tượng hoặc IP',
    showSort: true,
    showFilter: true,
    showSetting: true,
    showPagination: true,
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    rowActions: [{ key: 'detail', label: 'Xem chi tiết', icon: 'eye' }],
    quickFilters: [
      { key: 'module', placeholder: 'Tất cả phân hệ', options: ['Xác thực', 'Nhân viên', 'Vai trò', 'Hợp đồng', 'Nghỉ phép', 'Tài khoản', 'Tính lương', 'Cấu hình'].map((value) => ({ label: value, value })) },
      { key: 'action', placeholder: 'Tất cả hành động', options: ['Đăng nhập', 'Đăng xuất', 'Tạo mới', 'Cập nhật', 'Xóa', 'Phân quyền', 'Gửi duyệt', 'Từ chối', 'Chốt kỳ'].map((value) => ({ label: value, value })) },
      { key: 'result', placeholder: 'Tất cả kết quả', options: [{ label: 'Thành công', value: 'Thành công' }, { label: 'Thất bại', value: 'Thất bại' }] },
    ],
    striped: true,
    size: 'small',
    scrollX: '1180px',
    emptyText: 'Không có bản ghi audit log phù hợp',
  };

  onActionClick(event: SsDtActionClick<AdminAuditLog>): void {
    if (event.action.key !== 'detail') return;
    this.selectedLog.set(event.row);
    this.detailVisible.set(true);
  }

  closeDetail(): void {
    this.detailVisible.set(false);
  }

  exportLogs(): void {
    this.toast.show({ severity: 'success', summary: 'Đã chuẩn bị dữ liệu', detail: `Đã chuẩn bị ${this.logs().length} bản ghi audit log để xuất báo cáo.` });
  }
}
