import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SsButtonComponent, SsCardComponent, SsConfirmService, SsDataTableComponent, SsDialogComponent, SsDtActionClick, SsDtButton, SsDtColumn, SsDtConfig, SsStatComponent, SsTagComponent, SsToastService } from '@platform/ui-kit';
import { AdminSalaryStructureService } from '../../../salary-structures/services/admin-salary-structure.service';
import { AdminPayrollRun, AdminPayrollRunStatus } from '../../models/admin-payroll-run.model';
import { AdminPayrollRunService } from '../../services/admin-payroll-run.service';

interface PayrollRunForm {
  periodYear: number;
  periodMonth: number;
  note: string;
}

@Component({
  selector: 'app-admin-payroll-run',
  standalone: true,
  imports: [CommonModule, FormsModule, SsButtonComponent, SsCardComponent, SsDataTableComponent, SsDialogComponent, SsStatComponent, SsTagComponent],
  templateUrl: './admin-payroll-run.component.html',
  styleUrl: './admin-payroll-run.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPayrollRunComponent {
  private readonly payrollService = inject(AdminPayrollRunService);
  private readonly salaryStructureService = inject(AdminSalaryStructureService);
  private readonly confirmService = inject(SsConfirmService);
  private readonly toast = inject(SsToastService);

  readonly runs = signal(this.payrollService.runs);
  readonly selectedRun = signal<AdminPayrollRun | null>(null);
  readonly detailVisible = signal(false);
  readonly formVisible = signal(false);
  readonly editingRun = signal<AdminPayrollRun | null>(null);
  readonly runForm: PayrollRunForm = { periodYear: 2025, periodMonth: 11, note: '' };
  readonly activeSalaryStructureCount = this.salaryStructureService.structures.filter((structure) => structure.status === 'Đang áp dụng').length;
  readonly structureVersion = 'Khung lương 2025';
  readonly runColumns: SsDtColumn<AdminPayrollRun>[] = [
    { key: 'periodLabel', header: 'Kỳ lương', field: 'periodLabel', width: '145px', sortable: true, filterable: true },
    { key: 'salaryStructureLabel', header: 'Thang bảng lương', field: 'salaryStructureLabel', width: '175px', filterable: true },
    { key: 'employeeCount', header: 'Nhân sự', format: (row) => `${row.employeeCount} người`, width: '105px', align: 'right', sortable: true },
    { key: 'totalGross', header: 'Tổng Gross', type: 'number', format: (row) => this.formatCurrency(row.totalGross), width: '155px', align: 'right', sortable: true },
    { key: 'totalNet', header: 'Tổng Net', type: 'number', format: (row) => this.formatCurrency(row.totalNet), width: '155px', align: 'right', sortable: true },
    { key: 'createdAt', header: 'Ngày tạo', field: 'createdAt', width: '145px', sortable: true },
    { key: 'status', header: 'Trạng thái', field: 'status', type: 'status', width: '125px', options: [{ label: 'Nháp', value: 'Nháp', color: '#7d8da6' }, { label: 'Chờ duyệt', value: 'Chờ duyệt', color: '#f59f3d' }, { label: 'Đã duyệt', value: 'Đã duyệt', color: '#4d8dff' }, { label: 'Đã trả', value: 'Đã trả', color: '#32b36b' }] },
  ];

  runTableSettings: SsDtConfig<AdminPayrollRun> = {
    rowKey: 'id',
    title: 'Danh sách kỳ tính lương',
    description: 'Theo dõi quá trình tính, duyệt và chi trả theo từng tháng',
    cardIcon: 'calculator',
    cardStatusLabel: `${this.runs().length} kỳ lương`,
    cardStatusType: 'info',
    primaryButtons: [{ key: 'create-run', label: 'Tạo kỳ lương', type: 'primary', icon: 'plus' }],
    searchable: true,
    searchPlaceholder: 'Tìm theo kỳ lương hoặc thang bảng lương',
    showSort: true,
    showFilter: true,
    showSetting: true,
    showPagination: true,
    pageSize: 6,
    pageSizeOptions: [6, 10, 20],
    rowActions: [
      { key: 'detail', label: 'Xem chi tiết', icon: 'eye' },
      { key: 'calculate', label: 'Tính lương', icon: 'calculator', visible: (row) => row.status === 'Nháp' },
      { key: 'approve', label: 'Duyệt kỳ lương', icon: 'check', visible: (row) => row.status === 'Chờ duyệt' },
      { key: 'paid', label: 'Đánh dấu đã trả', icon: 'bank', visible: (row) => row.status === 'Đã duyệt' },
      { key: 'delete', label: 'Xóa kỳ lương', icon: 'delete', danger: true, visible: (row) => row.status === 'Nháp' },
    ],
    quickFilters: [
      { key: 'status', placeholder: 'Tất cả trạng thái', options: [{ label: 'Nháp', value: 'Nháp' }, { label: 'Chờ duyệt', value: 'Chờ duyệt' }, { label: 'Đã duyệt', value: 'Đã duyệt' }, { label: 'Đã trả', value: 'Đã trả' }] },
      { key: 'periodYear', placeholder: 'Tất cả năm', options: [{ label: '2025', value: 2025 }, { label: '2024', value: 2024 }] },
    ],
    striped: true,
    size: 'small',
    scrollX: '1100px',
    emptyText: 'Không có kỳ tính lương phù hợp',
  };

  get currentRun(): AdminPayrollRun | null {
    return this.runs().find((run) => run.status !== 'Đã trả') ?? this.runs()[0] ?? null;
  }

  get draftCount(): number {
    return this.runs().filter((run) => run.status === 'Nháp').length;
  }

  get waitingApprovalCount(): number {
    return this.runs().filter((run) => run.status === 'Chờ duyệt').length;
  }

  get paidCount(): number {
    return this.runs().filter((run) => run.status === 'Đã trả').length;
  }

  get currentGross(): number {
    return this.currentRun?.totalGross ?? 0;
  }

  get currentNet(): number {
    return this.currentRun?.totalNet ?? 0;
  }

  onPrimaryClick(button: SsDtButton): void {
    if (button.key === 'create-run') this.openCreateDialog();
  }

  onActionClick(event: SsDtActionClick<AdminPayrollRun>): void {
    if (event.action.key === 'detail') {
      this.selectedRun.set(event.row);
      this.detailVisible.set(true);
      return;
    }
    if (event.action.key === 'calculate') {
      void this.calculateRun(event.row);
      return;
    }
    if (event.action.key === 'approve') {
      void this.approveRun(event.row);
      return;
    }
    if (event.action.key === 'paid') {
      void this.markAsPaid(event.row);
      return;
    }
    if (event.action.key === 'delete') void this.deleteRun(event.row);
  }

  openCreateDialog(): void {
    const latest = this.runs()[0];
    this.runForm.periodYear = latest?.periodYear ?? 2025;
    this.runForm.periodMonth = Math.min((latest?.periodMonth ?? 10) + 1, 12);
    this.runForm.note = '';
    this.editingRun.set(null);
    this.formVisible.set(true);
  }

  closeDetail(): void {
    this.detailVisible.set(false);
  }

  closeFormDialog(): void {
    this.formVisible.set(false);
  }

  saveRun(formValid: boolean): void {
    if (!formValid) return;
    if (this.runs().some((run) => run.periodYear === Number(this.runForm.periodYear) && run.periodMonth === Number(this.runForm.periodMonth))) {
      this.toast.show({ severity: 'warning', summary: 'Kỳ lương đã tồn tại', detail: `Tháng ${this.runForm.periodMonth}/${this.runForm.periodYear} đã có trong danh sách.` });
      return;
    }
    const run: AdminPayrollRun = {
      id: Date.now(),
      periodYear: Number(this.runForm.periodYear),
      periodMonth: Number(this.runForm.periodMonth),
      periodLabel: `Tháng ${this.runForm.periodMonth}/${this.runForm.periodYear}`,
      salaryStructureLabel: this.structureVersion,
      employeeCount: 248,
      totalGross: 0,
      totalDeduction: 0,
      totalNet: 0,
      status: 'Nháp',
      createdAt: '07/10/2025 09:00',
      approvedBy: '',
      approvedAt: '',
      paidAt: '',
      note: this.runForm.note.trim() || 'Kỳ lương mới được khởi tạo, chưa tính dữ liệu.',
    };
    this.runs.update((runs) => [run, ...runs]);
    this.refreshTableStatus();
    this.closeFormDialog();
    this.toast.show({ severity: 'success', summary: 'Tạo kỳ lương thành công', detail: `${run.periodLabel} đã được tạo theo ${this.structureVersion}.` });
  }

  async calculateRun(run: AdminPayrollRun): Promise<void> {
    const confirmed = await this.confirmService.confirm(
      'Xác nhận tính lương',
      `Hệ thống sẽ tính ${run.periodLabel} theo ${run.salaryStructureLabel} và dữ liệu chấm công hiện tại.`,
      { type: 'warning', okText: 'Bắt đầu tính' },
    );
    if (!confirmed) return;
    this.updateRun(run, this.calculatedAmounts(run), { status: 'Chờ duyệt' });
    this.toast.show({ severity: 'success', summary: 'Tính lương hoàn tất', detail: `${run.periodLabel} đã chuyển sang trạng thái chờ duyệt.` });
  }

  async approveRun(run: AdminPayrollRun): Promise<void> {
    const confirmed = await this.confirmService.confirm(
      'Xác nhận duyệt kỳ lương',
      `Bạn có chắc muốn duyệt ${run.periodLabel} với tổng Net ${this.formatCurrency(run.totalNet)} không?`,
      { type: 'warning', okText: 'Duyệt kỳ lương' },
    );
    if (!confirmed) return;
    this.updateRun(run, { status: 'Đã duyệt', approvedBy: 'Quản trị viên', approvedAt: '07/10/2025 09:15' });
    this.toast.show({ severity: 'success', summary: 'Duyệt kỳ lương thành công', detail: `${run.periodLabel} đã sẵn sàng để chi trả.` });
  }

  async markAsPaid(run: AdminPayrollRun): Promise<void> {
    const confirmed = await this.confirmService.confirm(
      'Xác nhận đã trả lương',
      `Xác nhận ngân hàng đã hoàn tất chi trả cho ${run.employeeCount} nhân sự trong ${run.periodLabel}?`,
      { type: 'warning', okText: 'Đã trả lương' },
    );
    if (!confirmed) return;
    this.updateRun(run, { status: 'Đã trả', paidAt: '07/10/2025 09:30' });
    this.toast.show({ severity: 'success', summary: 'Đã ghi nhận chi trả', detail: `${run.periodLabel} đã được đánh dấu là đã trả.` });
  }

  async deleteRun(run: AdminPayrollRun): Promise<void> {
    const confirmed = await this.confirmService.confirm('Xác nhận xóa kỳ lương', `Bạn có chắc muốn xóa kỳ ${run.periodLabel} đang ở trạng thái nháp không?`, { type: 'danger', okText: 'Xóa' });
    if (!confirmed) return;
    this.runs.update((runs) => runs.filter((item) => item.id !== run.id));
    this.refreshTableStatus();
    this.toast.show({ severity: 'success', summary: 'Đã xóa kỳ lương', detail: `${run.periodLabel} đã được xóa.` });
  }

  statusTone(status: AdminPayrollRunStatus): 'success' | 'warning' | 'error' | 'info' | 'default' {
    if (status === 'Đã trả') return 'success';
    if (status === 'Chờ duyệt') return 'warning';
    if (status === 'Đã duyệt') return 'info';
    return status === 'Nháp' ? 'default' : 'error';
  }

  progressForStatus(status: AdminPayrollRunStatus): number {
    return { 'Nháp': 20, 'Chờ duyệt': 65, 'Đã duyệt': 85, 'Đã trả': 100 }[status];
  }

  formatCurrency(value: number): string {
    return `${new Intl.NumberFormat('vi-VN').format(value)} VNĐ`;
  }

  private calculatedAmounts(run: AdminPayrollRun): Pick<AdminPayrollRun, 'totalGross' | 'totalDeduction' | 'totalNet'> {
    if (run.totalGross > 0) return { totalGross: run.totalGross, totalDeduction: run.totalDeduction, totalNet: run.totalNet };
    const totalGross = 4856000000;
    const totalDeduction = 620400000;
    return { totalGross, totalDeduction, totalNet: totalGross - totalDeduction };
  }

  private updateRun(run: AdminPayrollRun, changes: Partial<AdminPayrollRun>, amounts: Partial<AdminPayrollRun> = {}): void {
    const updatedRun = { ...run, ...amounts, ...changes };
    this.runs.update((runs) => runs.map((item) => item.id === run.id ? updatedRun : item));
    this.selectedRun.set(updatedRun);
  }

  private refreshTableStatus(): void {
    this.runTableSettings = { ...this.runTableSettings, cardStatusLabel: `${this.runs().length} kỳ lương` };
  }
}
