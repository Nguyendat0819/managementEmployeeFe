import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable, map } from 'rxjs';
import {
  SsButtonComponent,
  SsConfirmService,
  SsDataTableComponent,
  SsDialogComponent,
  SsDtActionClick,
  SsDtButton,
  SsDtColumn,
  SsDtConfig,
  SsDtPage,
  SsDtQuery,
  SsToastService,
} from '@platform/ui-kit';
import { AdminPosition, PositionCreateRequest, PositionResponse, PositionUpdateRequest } from '../../models/admin-position.model';
import { AdminPositionService } from '../../services/admin-position.service';

interface PositionForm {
  code: string;
  title: string;
  level: string;
  baseSalaryMin: number | null;
  baseSalaryMax: number | null;
}

@Component({
  selector: 'app-admin-position-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SsButtonComponent, SsDataTableComponent, SsDialogComponent],
  templateUrl: './admin-position-list.component.html',
  styleUrl: './admin-position-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPositionListComponent {
  @ViewChild(SsDataTableComponent) private positionTable?: SsDataTableComponent<AdminPosition>;

  private readonly positionService = inject(AdminPositionService);
  private readonly confirmService = inject(SsConfirmService);
  private readonly toast = inject(SsToastService);

  readonly positions = signal<AdminPosition[]>([]);
  readonly selectedPosition = signal<AdminPosition | null>(null);
  readonly totalPositions = signal(0);
  readonly detailVisible = signal(false);
  readonly formVisible = signal(false);
  readonly editingPosition = signal<AdminPosition | null>(null);
  readonly positionForm: PositionForm = this.emptyPositionForm();
  readonly levelOptions = ['ENTRY', 'JUNIOR', 'MIDDLE', 'SENIOR', 'LEAD', 'MANAGER', 'DIRECTOR'];

  readonly positionColumns: SsDtColumn<AdminPosition>[] = [
    { key: 'positionCode', header: 'Mã chức vụ', field: 'code', width: '170px', sortable: true },
    { key: 'title', header: 'Tên chức vụ', field: 'title', width: '230px', sortable: true },
    { key: 'level', header: 'Cấp bậc', field: 'level', width: '135px', sortable: true },
    { key: 'salaryRange', header: 'Khoảng lương', format: (row) => `${this.formatSalary(row.baseSalaryMin)} - ${this.formatSalary(row.baseSalaryMax)}`, width: '250px', sortable: false },
    { key: 'employeeCount', header: 'Nhân viên', format: (row) => `${row.employeeCount} người`, width: '125px', align: 'right', sortable: true },
    { key: 'isDeleted', header: 'Trạng thái', field: 'status', type: 'status', width: '145px', sortable: true, options: [
      { label: 'Đang hoạt động', value: 'Đang hoạt động', color: '#32b36b' },
      { label: 'Đã xóa', value: 'Đã xóa', color: '#8c8c8c' },
    ] },
    { key: 'updatedAt', header: 'Cập nhật', field: 'updatedAt', width: '120px', sortable: true },
  ];

  positionTableSettings: SsDtConfig<AdminPosition> = {
    rowKey: 'id',
    title: 'Danh sách chức vụ',
    description: 'Quản lý danh mục chức vụ và khoảng lương chuẩn của hệ thống',
    cardIcon: 'solution',
    cardStatusLabel: '0 chức vụ',
    cardStatusType: 'info',
    primaryButtons: [{ key: 'create-position', label: 'Thêm chức vụ', type: 'primary', icon: 'plus' }],
    searchable: true,
    searchPlaceholder: 'Tìm theo mã, tên hoặc cấp bậc chức vụ',
    showSort: true,
    showFilter: false,
    showSetting: true,
    showPagination: true,
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    rowActions: [
      { key: 'detail', label: 'Xem chi tiết', icon: 'eye' },
      { key: 'edit', label: 'Sửa', icon: 'edit', visible: (row) => row.status === 'Đang hoạt động' },
      { key: 'delete', label: 'Xóa', icon: 'delete', danger: true, visible: (row) => row.status === 'Đang hoạt động' },
    ],
    quickFilters: [
      {
        key: 'level',
        placeholder: 'Tất cả cấp bậc',
        options: this.levelOptions.map((level) => ({ label: level, value: level })),
      },
      {
        key: 'isDeleted',
        placeholder: 'Tất cả trạng thái',
        value: 'false',
        options: [
          { label: 'Đang hoạt động', value: 'false' },
          { label: 'Đã xóa', value: 'true' },
        ],
      },
    ],
    dataSource: (query) => this.searchPositions(query),
    striped: true,
    size: 'small',
    scrollX: '1180px',
    emptyText: 'Không có chức vụ phù hợp',
  };

  onPrimaryClick(button: SsDtButton): void {
    if (button.key !== 'create-position') return;
    Object.assign(this.positionForm, this.emptyPositionForm());
    this.editingPosition.set(null);
    this.formVisible.set(true);
  }

  onActionClick(event: SsDtActionClick<AdminPosition>): void {
    if (event.action.key === 'detail') {
      this.openDetail(event.row.id);
      return;
    }
    if (event.action.key === 'edit') {
      this.openEditDialog(event.row.id);
      return;
    }
    if (event.action.key === 'delete') void this.deletePosition(event.row);
  }

  closeDetail(): void {
    this.detailVisible.set(false);
  }

  closeFormDialog(): void {
    this.formVisible.set(false);
  }

  savePosition(formValid: boolean): void {
    if (!formValid) return;
    const min = Number(this.positionForm.baseSalaryMin);
    const max = Number(this.positionForm.baseSalaryMax);
    if (!Number.isFinite(min) || !Number.isFinite(max) || min < 0 || max < min) {
      this.toast.show({ severity: 'warning', summary: 'Khoảng lương không hợp lệ', detail: 'Lương tối thiểu phải nhỏ hơn hoặc bằng lương tối đa.' });
      return;
    }

    const editingPosition = this.editingPosition();
    const title = this.positionForm.title.trim();
    const level = this.positionForm.level.trim();
    const operation = editingPosition
      ? this.positionService.updatePosition(editingPosition.id, { title, level, baseSalaryMin: min, baseSalaryMax: max } satisfies PositionUpdateRequest)
      : this.positionService.createPosition({ positionCode: this.positionForm.code.trim().toUpperCase(), title, level, baseSalaryMin: min, baseSalaryMax: max } satisfies PositionCreateRequest);

    operation.subscribe({
      next: () => {
        this.closeFormDialog();
        this.positionTable?.retry();
        this.toast.show({ severity: 'success', summary: editingPosition ? 'Đã cập nhật chức vụ' : 'Đã thêm chức vụ', detail: `Chức vụ ${title} đã được lưu.` });
      },
    });
  }

  private openDetail(id: number): void {
    this.positionService.getPosition(id).subscribe({
      next: (response) => {
        this.selectedPosition.set(this.toAdminPosition(response.data));
        this.detailVisible.set(true);
      },
    });
  }

  private openEditDialog(id: number): void {
    this.positionService.getPosition(id).subscribe({
      next: (response) => {
        const position = response.data;
        Object.assign(this.positionForm, {
          code: position.positionCode,
          title: position.title,
          level: position.level,
          baseSalaryMin: position.baseSalaryMin,
          baseSalaryMax: position.baseSalaryMax,
        });
        this.editingPosition.set(this.toAdminPosition(position));
        this.formVisible.set(true);
      },
    });
  }

  private async deletePosition(position: AdminPosition): Promise<void> {
    const confirmed = await this.confirmService.confirm(
      'Xác nhận xóa chức vụ',
      `Bạn có chắc muốn xóa chức vụ "${position.title}" không?`,
      { type: 'danger', okText: 'Xóa' },
    );
    if (!confirmed) return;
    this.positionService.deletePosition(position.id).subscribe({
      next: () => {
        this.positionTable?.retry();
        this.toast.show({ severity: 'success', summary: 'Đã xóa chức vụ', detail: `Chức vụ ${position.title} đã được xóa.` });
      },
    });
  }

  private searchPositions(query: SsDtQuery): Observable<SsDtPage<AdminPosition>> {
    const deletedFilter = query.filter['isDeleted'];
    const isDeleted = deletedFilter === 'true' ? true : deletedFilter === 'false' ? false : undefined;
    return this.positionService.searchPositions({
      page: query.pageIndex - 1,
      size: query.pageSize,
      search: query.search || undefined,
      sorts: query.sort.map((sort) => `${sort.key},${sort.order}`),
      level: query.filter['level'] || undefined,
      isDeleted,
    }).pipe(
      map((response) => {
        const rows = (response.data?.content ?? []).map((position) => this.toAdminPosition(position));
        const total = response.data?.totalElements ?? 0;
        this.positions.set(rows);
        this.totalPositions.set(total);
        this.positionTableSettings.cardStatusLabel = `${total} chức vụ`;
        return { data: rows, total };
      }),
    );
  }

  private toAdminPosition(position: PositionResponse): AdminPosition {
    return {
      id: position.id,
      code: position.positionCode,
      title: position.title,
      level: position.level,
      baseSalaryMin: position.baseSalaryMin,
      baseSalaryMax: position.baseSalaryMax,
      employeeCount: position.employeeCount ?? 0,
      status: position.isDeleted ? 'Đã xóa' : 'Đang hoạt động',
      updatedAt: this.formatDate(position.updatedAt ?? position.createdAt),
    };
  }

  private formatSalary(value: number): string {
    return `${new Intl.NumberFormat('vi-VN').format(value ?? 0)} đ`;
  }

  private formatDate(value: string | null | undefined): string {
    if (!value) return 'Chưa cập nhật';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('vi-VN');
  }

  private emptyPositionForm(): PositionForm {
    return { code: '', title: '', level: 'MIDDLE', baseSalaryMin: null, baseSalaryMax: null };
  }
}
