import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { SsButtonComponent, SsDataTableComponent, SsDialogComponent, SsDtActionClick, SsDtColumn, SsDtConfig, SsStatComponent, SsTagComponent, SsToastService } from '@platform/ui-kit';
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
export class PayslipEmployeeComponent {
  private readonly payslipService = inject(PayslipEmployeeService);
  private readonly toast = inject(SsToastService);

  readonly payslips = this.payslipService.payslips;
  readonly latestDetail = this.payslipService.latestDetail;
  readonly selectedPayslip = signal<PayslipSummary | null>(null);
  readonly detailVisible = signal(false);
  readonly payslipColumns: SsDtColumn<PayslipSummary>[] = [
    { key: 'month', header: 'Kỳ lương', field: 'month', filterable: true, width: '110px' },
    { key: 'period', header: 'Thời gian', field: 'period' },
    { key: 'netSalary', header: 'Thực nhận', field: 'netSalary', width: '170px' },
    { key: 'paymentDate', header: 'Ngày thanh toán', field: 'paymentDate', sortable: true, width: '140px' },
    { key: 'bankName', header: 'Ngân hàng', field: 'bankName', filterable: true, width: '140px' },
    { key: 'accountNumber', header: 'Tài khoản', field: 'accountNumber', width: '150px' },
    { key: 'status', header: 'Trạng thái', field: 'status', filterable: true, width: '140px' },
  ];
  readonly payslipTableSettings: SsDtConfig<PayslipSummary> = {
    rowKey: 'month',
    title: 'Phiếu lương & Thông tin thanh toán',
    description: 'Tra cứu các kỳ lương và tài khoản nhận lương',
    cardIcon: 'file-done',
    searchable: true,
    searchPlaceholder: 'Tìm theo kỳ lương, ngân hàng hoặc trạng thái',
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
    emptyText: 'Chưa có phiếu lương',
  };

  openDetail(event: SsDtActionClick<PayslipSummary>): void {
    if (event.action.key !== 'detail') return;
    this.selectedPayslip.set(event.row);
    this.detailVisible.set(true);
  }

  closeDetail(): void {
    this.detailVisible.set(false);
  }

  downloadPayslip(): void {
    const month = this.selectedPayslip()?.month ?? 'gần nhất';
    this.toast.show({ severity: 'success', summary: 'Đang tải phiếu lương', detail: 'Phiếu lương tháng ' + month + ' đã sẵn sàng để tải xuống.' });
  }
}
