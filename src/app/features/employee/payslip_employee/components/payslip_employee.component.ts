import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { SsButtonComponent, SsDataTableComponent, SsDialogComponent, SsDtActionClick, SsDtColumn, SsDtConfig, SsStatComponent, SsTagComponent } from '@platform/ui-kit';
import { PayslipSummary } from '../model/payslip_employee.model';
import { PayslipEmployeeService } from '../service/payslip_employee.service';

@Component({
  selector: 'app-payslip-employee',
  standalone: true,
  imports: [CommonModule, SsButtonComponent, SsDataTableComponent, SsDialogComponent, SsStatComponent, SsTagComponent],
  templateUrl: './payslip_employee.component.html',
  styleUrl: './payslip_employee.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PayslipEmployeeComponent implements OnInit {
  private readonly payslipService = inject(PayslipEmployeeService);

  readonly payslips = signal<PayslipSummary[]>([]);
  readonly latestPayslip = computed(() => this.payslips()[0] ?? null);
  readonly currentYear = new Date().getFullYear();
  readonly annualNet = computed(() => this.payslips()
    .filter((slip) => slip.periodYear === this.currentYear)
    .reduce((total, slip) => total + slip.netSalary, 0));
  readonly selectedPayslip = signal<PayslipSummary | null>(null);
  readonly detailVisible = signal(false);
  payslipTableSettings: SsDtConfig<PayslipSummary> = {
    rowKey: 'id',
    loading: true,
    title: 'Phiếu lương đã thanh toán',
    description: 'Tra cứu các kỳ lương đã được công ty chi trả',
    cardIcon: 'file-done',
    searchable: true,
    searchPlaceholder: 'Tìm theo kỳ lương hoặc trạng thái',
    showSort: true,
    showFilter: true,
    showSetting: true,
    showPagination: true,
    pageSize: 5,
    pageSizeOptions: [5, 10, 20],
    rowActions: [{ key: 'detail', label: 'Xem chi tiết', icon: 'eye' }],
    striped: true,
    size: 'small',
    scrollY: '330px',
    emptyText: 'Chưa có phiếu lương đã thanh toán',
  };
  readonly payslipColumns: SsDtColumn<PayslipSummary>[] = [
    { key: 'month', header: 'Kỳ lương', field: 'month', filterable: true, width: '110px', sortable: true },
    { key: 'period', header: 'Thời gian', field: 'period', width: '220px' },
    { key: 'grossSalary', header: 'Tổng thu nhập', format: (row) => this.formatCurrency(row.grossSalary), width: '165px', align: 'right', sortable: true },
    { key: 'totalDeduction', header: 'Khấu trừ', format: (row) => this.formatCurrency(row.totalDeduction), width: '150px', align: 'right', sortable: true },
    { key: 'netSalary', header: 'Thực nhận', format: (row) => this.formatCurrency(row.netSalary), width: '165px', align: 'right', sortable: true },
    { key: 'paymentDate', header: 'Ngày thanh toán', field: 'paymentDate', sortable: true, width: '155px' },
    { key: 'status', header: 'Trạng thái', field: 'status', filterable: true, width: '140px' },
  ];

  ngOnInit(): void {
    this.payslipService.getMyPayslips().pipe(finalize(() => {
      this.payslipTableSettings = { ...this.payslipTableSettings, loading: false };
    })).subscribe({
      next: (payslips) => this.payslips.set(payslips),
    });
  }

  openDetail(event: SsDtActionClick<PayslipSummary>): void {
    if (event.action.key !== 'detail') return;
    this.selectedPayslip.set(event.row);
    this.detailVisible.set(true);
  }

  closeDetail(): void {
    this.detailVisible.set(false);
  }

  formatCurrency(value: number): string {
    return `${new Intl.NumberFormat('vi-VN').format(value)} VNĐ`;
  }

  formatDeduction(value: number): string {
    return `- ${this.formatCurrency(value)}`;
  }

  otherNonTaskDeduction(slip: PayslipSummary): number {
    return Math.max(0, slip.otherDeduction - slip.belowThresholdTaskPenalty);
  }
}
