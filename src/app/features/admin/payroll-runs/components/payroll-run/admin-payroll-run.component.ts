import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { SsButtonComponent, SsCardComponent, SsConfirmService, SsDataTableComponent, SsDialogComponent, SsDtActionClick, SsDtButton, SsDtColumn, SsDtConfig, SsStatComponent, SsTagComponent, SsToastService } from '@platform/ui-kit';
import { AdminSalaryStructureService } from '../../../salary-structures/services/admin-salary-structure.service';
import { AdminPayslip, AdminPayrollRun, AdminPayrollRunStatus, PayslipLineRequest } from '../../models/admin-payroll-run.model';
import { AdminPayrollRunService } from '../../services/admin-payroll-run.service';

interface PayrollRunForm {
  periodYear: number;
  periodMonth: number;
  note: string;
}

type PayslipForm = PayslipLineRequest;

@Component({
  selector: 'app-admin-payroll-run',
  standalone: true,
  imports: [CommonModule, FormsModule, SsButtonComponent, SsCardComponent, SsDataTableComponent, SsDialogComponent, SsStatComponent, SsTagComponent],
  templateUrl: './admin-payroll-run.component.html',
  styleUrl: './admin-payroll-run.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPayrollRunComponent implements OnInit {
  private readonly payrollService = inject(AdminPayrollRunService);
  private readonly salaryStructureService = inject(AdminSalaryStructureService);
  private readonly confirmService = inject(SsConfirmService);
  private readonly toast = inject(SsToastService);

  readonly runs = signal<AdminPayrollRun[]>([]);
  readonly selectedRun = signal<AdminPayrollRun | null>(null);
  readonly runPayslips = signal<AdminPayslip[]>([]);
  readonly activeSalaryStructureCount = signal(0);
  readonly detailLoading = signal(false);
  readonly savingRun = signal(false);
  readonly savingPayslip = signal(false);
  readonly detailVisible = signal(false);
  readonly formVisible = signal(false);
  readonly entryFormVisible = signal(false);
  runTableSettings: SsDtConfig<AdminPayrollRun> = {
    rowKey: 'id',
    loading: true,
    title: 'Danh sách kỳ tính lương',
    description: 'Theo dõi từng kỳ, danh sách phiếu lương và trạng thái phê duyệt',
    cardIcon: 'calculator',
    cardStatusLabel: 'Đang tải kỳ lương',
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
      { key: 'submit', label: 'Gửi duyệt', icon: 'send', visible: (row) => row.status === 'Nháp' && row.employeeCount > 0 },
      { key: 'approve', label: 'Duyệt kỳ lương', icon: 'check', visible: (row) => row.status === 'Chờ duyệt' },
      { key: 'paid', label: 'Đánh dấu đã trả', icon: 'bank', visible: (row) => row.status === 'Đã duyệt' },
      { key: 'delete', label: 'Xóa kỳ lương', icon: 'delete', danger: true, visible: (row) => row.status === 'Nháp' },
    ],
    quickFilters: [
      { key: 'status', placeholder: 'Tất cả trạng thái', options: [{ label: 'Nháp', value: 'Nháp' }, { label: 'Chờ duyệt', value: 'Chờ duyệt' }, { label: 'Đã duyệt', value: 'Đã duyệt' }, { label: 'Đã trả', value: 'Đã trả' }] },
    ],
    striped: true,
    size: 'small',
    scrollX: '1100px',
    emptyText: 'Chưa có kỳ tính lương',
  };
  readonly runColumns: SsDtColumn<AdminPayrollRun>[] = [
    { key: 'periodLabel', header: 'Kỳ lương', field: 'periodLabel', width: '145px', sortable: true, filterable: true },
    { key: 'salaryStructureLabel', header: 'Thang bảng lương', field: 'salaryStructureLabel', width: '175px', filterable: true },
    { key: 'employeeCount', header: 'Nhân sự', format: (row) => `${row.employeeCount} người`, width: '105px', align: 'right', sortable: true },
    { key: 'totalGross', header: 'Tổng Gross', type: 'number', format: (row) => this.formatCurrency(row.totalGross), width: '155px', align: 'right', sortable: true },
    { key: 'totalNet', header: 'Tổng Net', type: 'number', format: (row) => this.formatCurrency(row.totalNet), width: '155px', align: 'right', sortable: true },
    { key: 'createdAt', header: 'Ngày tạo', field: 'createdAt', width: '145px', sortable: true },
    { key: 'status', header: 'Trạng thái', field: 'status', type: 'status', width: '125px', options: [{ label: 'Nháp', value: 'Nháp', color: '#7d8da6' }, { label: 'Chờ duyệt', value: 'Chờ duyệt', color: '#f59f3d' }, { label: 'Đã duyệt', value: 'Đã duyệt', color: '#4d8dff' }, { label: 'Đã trả', value: 'Đã trả', color: '#32b36b' }] },
  ];
  readonly payslipColumns: SsDtColumn<AdminPayslip>[] = [
    { key: 'employeeCode', header: 'Mã nhân viên', field: 'employeeCode', width: '135px', filterable: true },
    { key: 'baseSalary', header: 'Lương cơ bản', format: (row) => this.formatCurrency(row.baseSalary), width: '145px', align: 'right' },
    { key: 'grossSalary', header: 'Tổng Gross', format: (row) => this.formatCurrency(row.grossSalary), width: '145px', align: 'right' },
    { key: 'totalDeduction', header: 'Khấu trừ', format: (row) => this.formatCurrency(row.totalDeduction), width: '140px', align: 'right' },
    { key: 'netSalary', header: 'Thực nhận', format: (row) => this.formatCurrency(row.netSalary), width: '145px', align: 'right' },
  ];
  payslipTableSettings: SsDtConfig<AdminPayslip> = {
    rowKey: 'id',
    loading: false,
    title: 'Phiếu lương trong kỳ',
    description: 'Các khoản đã nhập cho từng nhân viên',
    cardIcon: 'file-done',
    searchable: true,
    searchPlaceholder: 'Tìm theo mã nhân viên',
    showSort: true,
    showFilter: true,
    showSetting: true,
    showPagination: true,
    pageSize: 5,
    pageSizeOptions: [5, 10, 20],
    striped: true,
    size: 'small',
    scrollX: '700px',
    scrollY: '260px',
    emptyText: 'Kỳ lương chưa có phiếu lương',
  };

  readonly runForm: PayrollRunForm = { periodYear: new Date().getFullYear(), periodMonth: new Date().getMonth() + 1, note: '' };
  readonly payslipForm: PayslipForm = this.emptyPayslipForm();

  ngOnInit(): void {
    this.loadRuns();
    this.salaryStructureService.getStructures().subscribe({
      next: (structures) => this.activeSalaryStructureCount.set(structures.filter((item) => item.status === 'Đang áp dụng').length),
    });
  }

  get currentRun(): AdminPayrollRun | null {
    return this.runs().find((run) => run.status !== 'Đã trả') ?? this.runs()[0] ?? null;
  }

  get structureVersion(): string {
    return this.currentRun?.salaryStructureLabel ?? `Khung lương ${new Date().getFullYear()}`;
  }

  get waitingApprovalCount(): number {
    return this.runs().filter((run) => run.status === 'Chờ duyệt').length;
  }

  get paidCount(): number {
    return this.runs().filter((run) => run.status === 'Đã trả').length;
  }

  get currentNet(): number {
    return this.currentRun?.totalNet ?? 0;
  }

  onPrimaryClick(button: SsDtButton): void {
    if (button.key === 'create-run') this.openCreateDialog();
  }

  onActionClick(event: SsDtActionClick<AdminPayrollRun>): void {
    if (event.action.key === 'detail') {
      this.openDetail(event.row);
      return;
    }
    if (event.action.key === 'submit') {
      void this.submitRun(event.row);
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
    const now = new Date();
    this.runForm.periodYear = latest ? (latest.periodMonth === 12 ? latest.periodYear + 1 : latest.periodYear) : now.getFullYear();
    this.runForm.periodMonth = latest ? (latest.periodMonth === 12 ? 1 : latest.periodMonth + 1) : now.getMonth() + 1;
    this.runForm.note = '';
    this.formVisible.set(true);
  }

  openDetail(run: AdminPayrollRun): void {
    this.selectedRun.set(run);
    this.runPayslips.set([]);
    this.entryFormVisible.set(false);
    this.detailVisible.set(true);
    this.detailLoading.set(true);
    this.payslipTableSettings = { ...this.payslipTableSettings, loading: true };
    this.payrollService.getPayslips(run.id).pipe(finalize(() => {
      this.detailLoading.set(false);
      this.payslipTableSettings = { ...this.payslipTableSettings, loading: false };
    })).subscribe({
      next: (payslips) => this.runPayslips.set(payslips),
    });
  }

  closeDetail(): void {
    this.detailVisible.set(false);
    this.entryFormVisible.set(false);
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
    this.savingRun.set(true);
    this.payrollService.createRun({
      periodYear: Number(this.runForm.periodYear),
      periodMonth: Number(this.runForm.periodMonth),
      note: this.runForm.note.trim(),
    }).pipe(finalize(() => this.savingRun.set(false))).subscribe({
      next: (run) => {
        this.runs.update((runs) => [run, ...runs]);
        this.refreshTableStatus();
        this.closeFormDialog();
        this.toast.show({ severity: 'success', summary: 'Tạo kỳ lương thành công', detail: `${run.periodLabel} đã được tạo.` });
      },
    });
  }

  savePayslip(formValid: boolean): void {
    const run = this.selectedRun();
    if (!formValid || !run) return;
    if (this.runPayslips().some((slip) => slip.employeeCode.toLowerCase() === this.payslipForm.employeeCode.trim().toLowerCase())) {
      this.toast.show({ severity: 'warning', summary: 'Phiếu lương đã tồn tại', detail: `Mã nhân viên ${this.payslipForm.employeeCode.trim()} đã có phiếu trong kỳ này.` });
      return;
    }

    const request: PayslipLineRequest = {
      ...this.payslipForm,
      employeeCode: this.payslipForm.employeeCode.trim(),
      baseSalary: Number(this.payslipForm.baseSalary),
      totalAllowance: Number(this.payslipForm.totalAllowance),
      overtimePay: Number(this.payslipForm.overtimePay),
      bonus: Number(this.payslipForm.bonus),
      socialInsurance: Number(this.payslipForm.socialInsurance),
      healthInsurance: Number(this.payslipForm.healthInsurance),
      pitDeduction: Number(this.payslipForm.pitDeduction),
      otherDeduction: Number(this.payslipForm.otherDeduction),
      workingDays: Number(this.payslipForm.workingDays),
      absentDays: Number(this.payslipForm.absentDays),
      overtimeHours: Number(this.payslipForm.overtimeHours),
    };
    this.savingPayslip.set(true);
    this.payrollService.addPayslip(run.id, request).pipe(finalize(() => this.savingPayslip.set(false))).subscribe({
      next: (payslip) => {
        const updatedPayslips = [...this.runPayslips(), payslip];
        this.runPayslips.set(updatedPayslips);
        this.payslipTableSettings = { ...this.payslipTableSettings };
        this.updateRun({
          ...run,
          employeeCount: updatedPayslips.length,
          totalGross: updatedPayslips.reduce((total, slip) => total + slip.grossSalary, 0),
          totalDeduction: updatedPayslips.reduce((total, slip) => total + slip.totalDeduction, 0),
          totalNet: updatedPayslips.reduce((total, slip) => total + slip.netSalary, 0),
        });
        this.payslipFormReset();
        this.entryFormVisible.set(false);
        this.refreshRun(run.id);
        this.toast.show({ severity: 'success', summary: 'Đã thêm phiếu lương', detail: `Đã thêm phiếu cho nhân viên ${payslip.employeeCode}.` });
      },
    });
  }

  async submitRun(run: AdminPayrollRun): Promise<void> {
    if (run.employeeCount < 1) {
      this.toast.show({ severity: 'warning', summary: 'Kỳ lương chưa có phiếu', detail: 'Nhập ít nhất một phiếu lương trước khi gửi duyệt.' });
      return;
    }
    const confirmed = await this.confirmService.confirm('Gửi kỳ lương để duyệt', `Gửi ${run.periodLabel} với ${run.employeeCount} phiếu lương để phê duyệt?`, { type: 'warning', okText: 'Gửi duyệt' });
    if (!confirmed) return;
    this.payrollService.submitRun(run.id).subscribe({
      next: (updated) => {
        this.updateRun(updated);
        this.toast.show({ severity: 'success', summary: 'Đã gửi kỳ lương', detail: `${updated.periodLabel} đang chờ phê duyệt.` });
      },
    });
  }

  async approveRun(run: AdminPayrollRun): Promise<void> {
    const confirmed = await this.confirmService.confirm(
      'Xác nhận duyệt kỳ lương',
      `Bạn có chắc muốn duyệt ${run.periodLabel} với tổng Net ${this.formatCurrency(run.totalNet)} không?`,
      { type: 'warning', okText: 'Duyệt kỳ lương' },
    );
    if (!confirmed) return;
    this.payrollService.approveRun(run.id).subscribe({
      next: (updated) => {
        this.updateRun(updated);
        this.toast.show({ severity: 'success', summary: 'Duyệt kỳ lương thành công', detail: `${updated.periodLabel} đã sẵn sàng để chi trả.` });
      },
    });
  }

  async markAsPaid(run: AdminPayrollRun): Promise<void> {
    const confirmed = await this.confirmService.confirm(
      'Xác nhận đã trả lương',
      `Xác nhận ngân hàng đã hoàn tất chi trả cho ${run.employeeCount} nhân sự trong ${run.periodLabel}?`,
      { type: 'warning', okText: 'Đã trả lương' },
    );
    if (!confirmed) return;
    this.payrollService.markRunPaid(run.id).subscribe({
      next: (updated) => {
        this.updateRun(updated);
        this.toast.show({ severity: 'success', summary: 'Đã ghi nhận chi trả', detail: `${updated.periodLabel} đã được đánh dấu là đã trả.` });
      },
    });
  }

  async deleteRun(run: AdminPayrollRun): Promise<void> {
    const confirmed = await this.confirmService.confirm('Xác nhận xóa kỳ lương', `Bạn có chắc muốn xóa kỳ ${run.periodLabel} đang ở trạng thái nháp không?`, { type: 'danger', okText: 'Xóa' });
    if (!confirmed) return;
    this.payrollService.deleteRun(run.id).subscribe({
      next: () => {
        this.runs.update((runs) => runs.filter((item) => item.id !== run.id));
        if (this.selectedRun()?.id === run.id) this.closeDetail();
        this.refreshTableStatus();
        this.toast.show({ severity: 'success', summary: 'Đã xóa kỳ lương', detail: `${run.periodLabel} đã được xóa.` });
      },
    });
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

  togglePayslipEntry(): void {
    this.payslipFormReset();
    this.entryFormVisible.update((visible) => !visible);
  }

  private loadRuns(): void {
    this.payrollService.getRuns().subscribe({
      next: (runs) => {
        this.runs.set(runs);
        this.refreshTableStatus();
      },
      error: () => this.refreshTableStatus(),
    });
  }

  private refreshRun(id: number): void {
    this.payrollService.getRuns().subscribe({
      next: (runs) => {
        this.runs.set(runs);
        this.selectedRun.set(runs.find((run) => run.id === id) ?? this.selectedRun());
        this.refreshTableStatus();
      },
    });
  }

  private updateRun(updatedRun: AdminPayrollRun): void {
    this.runs.update((runs) => runs.map((item) => item.id === updatedRun.id ? updatedRun : item));
    this.selectedRun.set(updatedRun);
    this.refreshTableStatus();
  }

  private refreshTableStatus(): void {
    this.runTableSettings = {
      ...this.runTableSettings,
      loading: false,
      cardStatusLabel: `${this.runs().length} kỳ lương`,
    };
  }

  private payslipFormReset(): void {
    Object.assign(this.payslipForm, this.emptyPayslipForm());
  }

  private emptyPayslipForm(): PayslipForm {
    return {
      employeeCode: '',
      baseSalary: 0,
      totalAllowance: 0,
      overtimePay: 0,
      bonus: 0,
      socialInsurance: 0,
      healthInsurance: 0,
      pitDeduction: 0,
      otherDeduction: 0,
      workingDays: 0,
      absentDays: 0,
      overtimeHours: 0,
    };
  }
}
