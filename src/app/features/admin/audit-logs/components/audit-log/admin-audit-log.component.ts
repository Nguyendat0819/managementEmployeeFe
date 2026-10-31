import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import {
  SsDataTableComponent,
  SsDialogComponent,
  SsDtActionClick,
  SsDtColumn,
  SsDtConfig,
  SsDtPage,
  SsDtQuery,
  SsToastService,
} from '@platform/ui-kit';
import { map, Observable } from 'rxjs';
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
export class AdminAuditLogComponent implements OnInit {
  private readonly auditLogService = inject(AdminAuditLogService);
  private readonly toast = inject(SsToastService);

  readonly logs = signal<AdminAuditLog[]>([]);
  readonly summary = signal({ total: 0, successful: 0, failed: 0, securityEvents: 0 });
  readonly selectedLog = signal<AdminAuditLog | null>(null);
  readonly detailVisible = signal(false);

  ngOnInit(): void {
    this.auditLogService.getSummary().subscribe({
      next: (response) => this.summary.set(response.data),
    });
  }

  get successfulCount(): number { return this.summary().successful; }

  get failedCount(): number {
    return this.summary().failed;
  }

  get securityEventCount(): number {
    return this.summary().securityEvents;
  }

  readonly columns: SsDtColumn<AdminAuditLog>[] = [
    { key: 'occurredAt', header: 'Thời gian', field: 'occurredAt', width: '170px', sortable: true },
    { key: 'actor', header: 'Người thực hiện', format: (row) => `${row.actorName} · ${row.actor}`, width: '205px', sortable: false },
    { key: 'action', header: 'Hành động', field: 'action', width: '125px', sortable: true },
    { key: 'module', header: 'Phân hệ', field: 'module', width: '135px', sortable: true },
    { key: 'target', header: 'Đối tượng', field: 'target', width: '265px' },
    { key: 'result', header: 'Kết quả', field: 'result', type: 'status', width: '120px', options: [{ label: 'Thành công', value: 'Thành công', color: '#32b36b' }, { label: 'Thất bại', value: 'Thất bại', color: '#ff4d4f' }] },
    { key: 'ipAddress', header: 'Địa chỉ IP', field: 'ipAddress', width: '135px' },
  ];

  readonly settings: SsDtConfig<AdminAuditLog> = {
    rowKey: 'id',
    title: 'Audit Log',
    description: 'Theo dõi lịch sử thao tác và các sự kiện bảo mật trong hệ thống',
    cardIcon: 'file-search',
    cardStatusLabel: 'Đang tải sự kiện',
    cardStatusType: 'info',
    searchable: true,
    searchPlaceholder: 'Tìm theo người thực hiện, hành động, phân hệ hoặc IP',
    showSort: true,
    showFilter: true,
    showSetting: true,
    showPagination: true,
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    rowActions: [{ key: 'detail', label: 'Xem chi tiết', icon: 'eye' }],
    quickFilters: [
      { key: 'module', placeholder: 'Tất cả phân hệ', options: [
        ['Xác thực', 'AUTH'], ['Nhân viên', 'EMPLOYEE'], ['Hợp đồng', 'CONTRACT'],
        ['Tổ chức', 'ORGANIZATION'], ['Chức vụ', 'POSITION'], ['Tài khoản', 'USER'],
        ['Vai trò', 'ROLE'], ['Phân quyền', 'ROLE_PERMISSION'], ['Quyền', 'PERMISSION'],
        ['Ca làm', 'SHIFT'], ['Phân ca', 'SHIFT_ASSIGNMENT'], ['Chấm công', 'ATTENDANCE'],
      ].map(([label, value]) => ({ label, value })) },
      { key: 'action', placeholder: 'Tất cả hành động', options: [
        ['Đăng nhập', 'LOGIN'], ['Đăng xuất', 'LOGOUT'], ['Tạo mới', 'CREATE'],
        ['Cập nhật', 'UPDATE'], ['Xóa', 'DELETE'], ['Đổi mật khẩu', 'CHANGE_PASSWORD'],
        ['Khôi phục mật khẩu', 'FORGOT_PASSWORD'], ['Làm mới phiên', 'TOKEN_REFRESH'],
        ['Chấm công vào', 'CHECK_IN'], ['Chấm công ra', 'CHECK_OUT'],
      ].map(([label, value]) => ({ label, value })) },
      { key: 'result', placeholder: 'Tất cả kết quả', options: [{ label: 'Thành công', value: 'SUCCESS' }, { label: 'Thất bại', value: 'FAILURE' }] },
    ],
    dataSource: (query) => this.searchLogs(query),
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
    const rows = this.logs();
    if (rows.length === 0) {
      this.toast.show({ severity: 'info', summary: 'Chưa có dữ liệu', detail: 'Không có bản ghi trên trang hiện tại để xuất.' });
      return;
    }

    const values = [
      ['Thời gian', 'Người thực hiện', 'Hành động', 'Phân hệ', 'Đối tượng', 'Kết quả', 'Địa chỉ IP', 'Chi tiết'],
      ...rows.map((row) => [row.occurredAt, `${row.actorName} (${row.actor})`, row.action, row.module,
        row.target, row.result, row.ipAddress, row.details]),
    ];
    const csv = values.map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'audit-logs.csv';
    link.click();
    URL.revokeObjectURL(url);
    this.toast.show({ severity: 'success', summary: 'Đã xuất báo cáo', detail: `Đã xuất ${rows.length} bản ghi của trang hiện tại.` });
  }

  private searchLogs(query: SsDtQuery): Observable<SsDtPage<AdminAuditLog>> {
    const filters = query.filter;
    const sorts = query.sort.map((sort) => `${sort.key},${sort.order}`);
    const params: Record<string, string | number | readonly (string | number)[]> = {
      page: query.pageIndex - 1,
      size: query.pageSize,
      search: query.search,
    };
    if (filters['module']) params['module'] = filters['module'];
    if (filters['action']) params['action'] = filters['action'];
    if (filters['result']) params['result'] = filters['result'];
    if (sorts.length) params['sorts'] = sorts;

    return this.auditLogService.searchLogs(params).pipe(
      map((response) => {
        const rows = (response.data?.content ?? []).map((row) => ({
          ...row,
          occurredAt: this.formatDate(row.occurredAt),
          ipAddress: row.ipAddress || '—',
          device: row.device || '—',
          details: row.details || 'Không có thêm chi tiết.',
        }));
        const total = response.data?.totalElements ?? 0;
        this.logs.set(rows);
        this.settings.cardStatusLabel = `${total} sự kiện`;
        return { data: rows, total };
      }),
    );
  }

  private formatDate(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    }).format(date);
  }
}
