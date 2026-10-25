import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { SsButtonComponent, SsConfirmService, SsCurrencyComponent, SsDataTableComponent, SsDatepickerComponent, SsDialogComponent, SsDtActionClick, SsDtButton, SsDtColumn, SsDtConfig, SsSelectComponent, SsStatComponent, SsTagComponent, SsToastService } from '@platform/ui-kit';
import { PositionResponse } from '../../../positions/models/admin-position.model';
import { AdminPositionService } from '../../../positions/services/admin-position.service';
import { AdminSalaryStructure, AdminSalaryStructureStatus } from '../../models/admin-salary-structure.model';
import { AdminSalaryStructureService } from '../../services/admin-salary-structure.service';

interface SalaryStructureForm {
  positionCode: string;
  positionName: string;
  grade: string;
  baseSalary: number;
  allowanceTotal: number;
  allowanceSummary: string;
  effectiveDate: string;
  status: AdminSalaryStructureStatus;
  formula: string;
  note: string;
}

@Component({
  selector: 'app-admin-salary-structure',
  standalone: true,
  imports: [CommonModule, FormsModule, SsButtonComponent, SsCurrencyComponent, SsDataTableComponent, SsDatepickerComponent, SsDialogComponent, SsSelectComponent, SsStatComponent, SsTagComponent],
  templateUrl: './admin-salary-structure.component.html',
  styleUrl: './admin-salary-structure.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSalaryStructureComponent implements OnInit {
  private readonly salaryService = inject(AdminSalaryStructureService);
  private readonly positionService = inject(AdminPositionService);
  private readonly confirmService = inject(SsConfirmService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly toast = inject(SsToastService);

  readonly structures = signal<AdminSalaryStructure[]>([]);
  readonly positions = signal<PositionResponse[]>([]);
  readonly positionLoading = signal(false);
  readonly saving = signal(false);
  readonly selectedStructure = signal<AdminSalaryStructure | null>(null);
  readonly detailVisible = signal(false);
  readonly formVisible = signal(false);
  readonly editingStructure = signal<AdminSalaryStructure | null>(null);
  readonly structureForm: SalaryStructureForm = this.emptyStructureForm();

  get positionOptions(): { label: string; value: string }[] {
    const options = this.positions().map((position) => ({
      label: `${position.positionCode} - ${position.title}`,
      value: position.positionCode,
    }));
    const editing = this.editingStructure();
    if (editing && !options.some((option) => option.value === editing.positionCode)) {
      return [{ label: `${editing.positionCode} - ${editing.positionName} (không còn hoạt động)`, value: editing.positionCode }, ...options];
    }
    return options;
  }
  readonly structureColumns: SsDtColumn<AdminSalaryStructure>[] = [
    { key: 'positionCode', header: 'Mã chức danh', field: 'positionCode', width: '145px', sortable: true, filterable: true },
    { key: 'positionName', header: 'Chức danh', field: 'positionName', width: '205px', sortable: true, filterable: true },
    { key: 'grade', header: 'Bậc lương', field: 'grade', width: '110px', filterable: true },
    { key: 'baseSalary', header: 'Lương cơ bản', type: 'number', format: (row) => this.formatCurrency(row.baseSalary), width: '155px', align: 'right', sortable: true },
    { key: 'allowanceTotal', header: 'Tổng phụ cấp', type: 'number', format: (row) => this.formatCurrency(row.allowanceTotal), width: '145px', align: 'right', sortable: true },
    { key: 'effectiveDate', header: 'Ngày hiệu lực', field: 'effectiveDate', width: '125px', sortable: true },
    { key: 'status', header: 'Trạng thái', field: 'status', type: 'status', width: '135px', options: [{ label: 'Đang áp dụng', value: 'Đang áp dụng', color: '#32b36b' }, { label: 'Chờ áp dụng', value: 'Chờ áp dụng', color: '#f59f3d' }, { label: 'Ngừng áp dụng', value: 'Ngừng áp dụng', color: '#7d8da6' }] },
  ];

  structureTableSettings: SsDtConfig<AdminSalaryStructure> = {
    rowKey: 'id',
    title: 'Danh sách thang bảng lương',
    description: 'Quản lý mức lương cơ bản và phụ cấp theo từng chức danh',
    cardIcon: 'database',
    loading: true,
    cardStatusLabel: `${this.activeCount} cấu trúc đang dùng`,
    cardStatusType: 'success',
    primaryButtons: [{ key: 'create-structure', label: 'Thêm cấu trúc', type: 'primary', icon: 'plus' }],
    searchable: true,
    searchPlaceholder: 'Tìm theo mã, chức danh hoặc bậc lương',
    showSort: true,
    showFilter: true,
    showSetting: true,
    showPagination: true,
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    rowActions: [
      { key: 'detail', label: 'Xem chi tiết', icon: 'eye' },
      { key: 'edit', label: 'Sửa', icon: 'edit' },
      { key: 'delete', label: 'Xóa', icon: 'delete', danger: true },
    ],
    quickFilters: [
      { key: 'status', placeholder: 'Tất cả trạng thái', options: [{ label: 'Đang áp dụng', value: 'Đang áp dụng' }, { label: 'Chờ áp dụng', value: 'Chờ áp dụng' }, { label: 'Ngừng áp dụng', value: 'Ngừng áp dụng' }] },
      { key: 'grade', placeholder: 'Tất cả bậc lương', options: [{ label: 'Bậc 1', value: 'Bậc 1' }, { label: 'Bậc 2', value: 'Bậc 2' }, { label: 'Bậc 3', value: 'Bậc 3' }] },
    ],
    striped: true,
    size: 'small',
    scrollX: '1100px',
    emptyText: 'Không có cấu trúc lương phù hợp',
  };

  ngOnInit(): void {
    this.loadStructures();
    this.loadPositions();
  }

  get activeCount(): number {
    return this.structures().filter((structure) => structure.status === 'Đang áp dụng').length;
  }

  get upcomingCount(): number {
    return this.structures().filter((structure) => structure.status === 'Chờ áp dụng').length;
  }

  get averageBaseSalary(): number {
    const activeStructures = this.structures().filter((structure) => structure.status === 'Đang áp dụng');
    return activeStructures.length ? Math.round(activeStructures.reduce((total, structure) => total + structure.baseSalary, 0) / activeStructures.length) : 0;
  }

  get highestSalary(): number {
    return this.structures().reduce((highest, structure) => Math.max(highest, structure.baseSalary), 0);
  }

  onPrimaryClick(button: SsDtButton): void {
    if (button.key === 'create-structure') this.openCreateDialog();
  }

  onActionClick(event: SsDtActionClick<AdminSalaryStructure>): void {
    if (event.action.key === 'detail') {
      this.selectedStructure.set(event.row);
      this.detailVisible.set(true);
      return;
    }
    if (event.action.key === 'edit') {
      this.openEditDialog(event.row);
      return;
    }
    if (event.action.key === 'delete') void this.deleteStructure(event.row);
  }

  openCreateDialog(): void {
    Object.assign(this.structureForm, this.emptyStructureForm());
    this.editingStructure.set(null);
    this.formVisible.set(true);
  }

  onPositionSelected(value: unknown): void {
    const positionCode = typeof value === 'string' ? value : '';
    const position = this.positions().find((item) => item.positionCode === positionCode);
    this.structureForm.positionCode = positionCode;
    this.structureForm.positionName = position?.title ?? '';
  }

  openEditDialog(structure: AdminSalaryStructure): void {
    Object.assign(this.structureForm, { ...structure, effectiveDate: this.toInputDate(structure.effectiveDate) });
    this.editingStructure.set(structure);
    this.formVisible.set(true);
  }

  closeDetail(): void {
    this.detailVisible.set(false);
  }

  closeFormDialog(): void {
    this.formVisible.set(false);
  }

  saveStructure(formValid: boolean): void {
    if (!formValid) return;
    const positionCode = this.structureForm.positionCode.trim();
    const editingStructure = this.editingStructure();
    const selectedPosition = this.positions().find((position) => position.positionCode === positionCode);
    const positionName = selectedPosition?.title ?? (editingStructure?.positionCode === positionCode ? editingStructure.positionName : '');
    if (!positionName) {
      this.toast.show({ severity: 'warning', summary: 'Chưa chọn chức danh', detail: 'Chọn một chức danh đang có trong danh mục.' });
      return;
    }
    if (this.structures().some((structure) =>
      structure.id !== editingStructure?.id
      && structure.positionCode.toLowerCase() === positionCode.toLowerCase()
      && this.toInputDate(structure.effectiveDate) === this.structureForm.effectiveDate,
    )) {
      this.toast.show({ severity: 'warning', summary: 'Cấu trúc lương đã tồn tại', detail: 'Chức danh này đã có cấu trúc tại ngày hiệu lực đã chọn.' });
      return;
    }

    const request = {
      positionCode,
      positionName,
      grade: this.structureForm.grade,
      baseSalary: Number(this.structureForm.baseSalary),
      allowanceTotal: Number(this.structureForm.allowanceTotal),
      allowanceSummary: this.structureForm.allowanceSummary.trim(),
      effectiveDate: this.structureForm.effectiveDate,
      status: this.structureForm.status,
      formula: this.structureForm.formula.trim(),
      note: this.structureForm.note.trim(),
    };

    this.saving.set(true);
    this.salaryService.saveStructure(request, editingStructure?.id)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (structure) => {
          this.structures.update((structures) => editingStructure
            ? structures.map((item) => item.id === structure.id ? structure : item)
            : [structure, ...structures]);
          this.refreshTableStatus();
          this.closeFormDialog();
          this.toast.show({ severity: 'success', summary: editingStructure ? 'Cập nhật cấu trúc thành công' : 'Thêm cấu trúc thành công', detail: `Cấu trúc lương cho ${positionName} đã được ${editingStructure ? 'cập nhật' : 'thêm vào danh sách'}.` });
        },
      });
  }

  async deleteStructure(structure: AdminSalaryStructure): Promise<void> {
    const confirmed = await this.confirmService.confirm(
      'Xác nhận xóa cấu trúc lương',
      `Bạn có chắc muốn xóa cấu trúc của "${structure.positionName}" không?`,
      { type: 'danger', okText: 'Xóa' },
    );
    if (!confirmed) return;
    this.salaryService.deleteStructure(structure.id).subscribe({
      next: () => {
        this.structures.update((structures) => structures.filter((item) => item.id !== structure.id));
        this.refreshTableStatus();
        this.toast.show({ severity: 'success', summary: 'Đã xóa cấu trúc lương', detail: `Cấu trúc ${structure.positionName} đã được xóa khỏi danh sách.` });
      },
    });
  }

  statusTone(status: AdminSalaryStructureStatus): 'success' | 'warning' | 'info' {
    if (status === 'Đang áp dụng') return 'success';
    if (status === 'Chờ áp dụng') return 'warning';
    return 'info';
  }

  formatCurrency(value: number): string {
    return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(value ?? 0)} VNĐ`;
  }

  toInputDate(value: string): string {
    if (value.includes('-')) return value;
    const [day, month, year] = value.split('/');
    return `${year}-${month}-${day}`;
  }

  private emptyStructureForm(): SalaryStructureForm {
    return { positionCode: '', positionName: '', grade: 'Bậc 1', baseSalary: 10000000, allowanceTotal: 0, allowanceSummary: '', effectiveDate: '', status: 'Đang áp dụng', formula: 'Lương cơ bản + phụ cấp cố định', note: '' };
  }

  private loadStructures(): void {
    this.structureTableSettings = { ...this.structureTableSettings, loading: true };
    this.salaryService.getStructures().pipe(finalize(() => {
      this.structureTableSettings = { ...this.structureTableSettings, loading: false };
    })).subscribe({
      next: (structures) => {
        this.structures.set(structures);
        this.refreshTableStatus();
      },
    });
  }

  private loadPositions(): void {
    this.positionLoading.set(true);
    this.positionService.searchPositions({ page: 0, size: 200, isDeleted: false }).pipe(finalize(() => {
      this.positionLoading.set(false);
      this.changeDetectorRef.markForCheck();
    })).subscribe({
      next: (response) => {
        this.positions.set(response.data?.content ?? []);
        this.changeDetectorRef.markForCheck();
      },
    });
  }

  private refreshTableStatus(): void {
    this.structureTableSettings = {
      ...this.structureTableSettings,
      cardStatusLabel: `${this.activeCount} cấu trúc đang dùng`,
    };
  }
}
