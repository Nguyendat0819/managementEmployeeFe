import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable, finalize, map } from 'rxjs';
import {
  SsButtonComponent,
  SsConfirmService,
  SsDataTableComponent,
  SsDatepickerComponent,
  SsDialogComponent,
  SsDtActionClick,
  SsDtButton,
  SsDtColumn,
  SsDtConfig,
  SsDtPage,
  SsDtQuery,
  SsSelectComponent,
  SsStatComponent,
  SsTagComponent,
  SsToastService,
} from '@platform/ui-kit';
import { AdminContract, EmployeeContractRequest, EmployeeContractResponse } from '../../models/admin-employee.model';
import { AdminEmployeeService } from '../../services/admin-employee.service';

interface ContractForm {
  contractNo: string;
  contractType: string;
  employeeCode: string;
  actualSalary: number;
  employmentType: string;
  startDate: string;
  endDate: string;
  signedDate: string;
  status: string;
}

@Component({
  selector: 'app-admin-contract-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SsButtonComponent, SsDataTableComponent, SsDatepickerComponent, SsDialogComponent, SsSelectComponent, SsStatComponent, SsTagComponent],
  templateUrl: './admin-contract-list.component.html',
  styleUrl: './admin-contract-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminContractListComponent implements OnInit {
  @ViewChild(SsDataTableComponent) private contractTable?: SsDataTableComponent<AdminContract>;

  private readonly employeeService = inject(AdminEmployeeService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly toast = inject(SsToastService);
  private readonly confirmService = inject(SsConfirmService);

  readonly contracts = signal<AdminContract[]>([]);
  employeeOptions: { label: string; value: string }[] = [];
  employeeLoading = false;
  readonly selectedContract = signal<AdminContract | null>(null);
  readonly detailVisible = signal(false);
  readonly formVisible = signal(false);
  readonly editingContract = signal<AdminContract | null>(null);
  readonly contractForm: ContractForm = this.emptyContractForm();
  readonly contractColumns: SsDtColumn<AdminContract>[] = [
    { key: 'contractNo', header: 'Số hợp đồng', field: 'contractNo', width: '150px', sortable: true, filterable: true },
    { key: 'employeeCode', header: 'Mã nhân viên', field: 'employeeCode', width: '130px', filterable: true },
    { key: 'fullName', header: 'Nhân viên', field: 'fullName', width: '180px', sortable: true, filterable: true },
    { key: 'contractType', header: 'Loại hợp đồng', field: 'contractType', width: '190px', filterable: true },
    { key: 'department', header: 'Phòng ban', field: 'department', width: '190px', filterable: true },
    {
      key: 'actualSalary',
      header: 'Lương thực nhận',
      type: 'number',
      format: (row) => `${new Intl.NumberFormat('vi-VN').format(row.actualSalary)} VNĐ`,
      width: '155px',
      align: 'right',
      sortable: true,
    },
    { key: 'startDate', header: 'Ngày bắt đầu', field: 'startDate', width: '125px', sortable: true },
    { key: 'endDate', header: 'Ngày kết thúc', field: 'endDate', width: '145px', sortable: true },
    {
      key: 'status',
      header: 'Trạng thái',
      field: 'status',
      type: 'status',
      width: '135px',
      options: [
        { label: 'Đang hiệu lực', value: 'Đang hiệu lực', color: '#52c41a' },
        { label: 'Sắp hết hạn', value: 'Sắp hết hạn', color: '#faad14' },
        { label: 'Đã hết hạn', value: 'Đã hết hạn', color: '#ff4d4f' },
      ],
    },
  ];
  contractTableSettings: SsDtConfig<AdminContract> = {
    rowKey: 'id',
    title: 'Danh sách hợp đồng lao động',
    description: 'Theo dõi thời hạn, loại hợp đồng và mức lương của từng nhân sự',
    cardIcon: 'file-text',
    cardStatusLabel: '0 hợp đồng',
    cardStatusType: 'info',
    primaryButtons: [{ key: 'create-contract', label: 'Thêm mới', type: 'primary', icon: 'plus' }],
    searchable: true,
    searchPlaceholder: 'Tìm theo số hợp đồng, mã hoặc tên nhân viên',
    showSort: true,
    showFilter: true,
    showSetting: true,
    showPagination: true,
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    rowActions: [
      { key: 'detail', label: 'Xem hợp đồng', icon: 'eye' },
      { key: 'edit', label: 'Sửa', icon: 'edit' },
      { key: 'delete', label: 'Xóa', icon: 'delete', danger: true },
    ],
    quickFilters: [
      {
        key: 'status',
        placeholder: 'Tất cả trạng thái',
        options: [
          { label: 'Đang hiệu lực', value: 'Đang hiệu lực' },
          { label: 'Sắp hết hạn', value: 'Sắp hết hạn' },
          { label: 'Đã hết hạn', value: 'Đã hết hạn' },
        ],
      },
      {
        key: 'employmentType',
        placeholder: 'Tất cả loại hình',
        options: [
          { label: 'Toàn thời gian', value: 'Toàn thời gian' },
          { label: 'Bán thời gian', value: 'Bán thời gian' },
          { label: 'Thử việc', value: 'Thử việc' },
        ],
      },
    ],
    dataSource: (query) => this.searchContracts(query),
    striped: true,
    size: 'small',
    scrollX: '1320px',
    emptyText: 'Không có hợp đồng phù hợp',
  };

  ngOnInit(): void {
    this.employeeLoading = true;
    this.employeeService.getEmployees()
      .pipe(finalize(() => {
        this.employeeLoading = false;
        this.changeDetectorRef.markForCheck();
      }))
      .subscribe({
        next: (response) => {
          this.employeeOptions = (response.data ?? []).map((employee) => ({
            label: `${employee.employeeCode} - ${employee.fullName}`,
            value: employee.employeeCode,
          }));
          this.changeDetectorRef.markForCheck();
        },
      });
  }

  onPrimaryClick(button: SsDtButton): void {
    if (button.key !== 'create-contract') return;
    Object.assign(this.contractForm, this.emptyContractForm());
    this.editingContract.set(null);
    this.formVisible.set(true);
  }

  onActionClick(event: SsDtActionClick<AdminContract>): void {
    if (event.action.key === 'detail') {
      this.employeeService.getContract(event.row.id).subscribe({
        next: (response) => {
          if (!response.data) return;
          this.selectedContract.set(this.toAdminContract(response.data));
          this.detailVisible.set(true);
        },
      });
      return;
    }
    if (event.action.key === 'edit') {
      this.openEditDialog(event.row);
      return;
    }
    if (event.action.key === 'delete') void this.deleteContract(event.row);
  }

  closeDetail(): void {
    this.detailVisible.set(false);
  }

  get activeCount(): number {
    return this.contracts().filter((contract) => contract.status === 'Đang hiệu lực').length;
  }

  get expiringCount(): number {
    return this.contracts().filter((contract) => contract.status === 'Sắp hết hạn').length;
  }

  get averageSalary(): string {
    if (!this.contracts().length) return '0';
    const average = this.contracts().reduce((total, contract) => total + contract.actualSalary, 0) / this.contracts().length / 1000000;
    return average.toFixed(1).replace('.', ',');
  }

  openEditDialog(contract: AdminContract): void {
    Object.assign(this.contractForm, {
      contractNo: contract.contractNo,
      contractType: contract.contractType,
      employeeCode: contract.employeeCode,
      actualSalary: contract.actualSalary,
      employmentType: contract.employmentType,
      startDate: this.toInputDate(contract.startDate),
      endDate: this.toInputDate(contract.endDate),
      signedDate: this.toInputDate(contract.signedDate),
      status: contract.status,
    });
    this.editingContract.set(contract);
    this.formVisible.set(true);
  }

  closeFormDialog(): void {
    this.formVisible.set(false);
  }

  saveContract(formValid: boolean): void {
    if (!formValid) return;
    const editingContract = this.editingContract();
    const request: EmployeeContractRequest = {
      contractNo: this.contractForm.contractNo.trim(),
      contractType: this.contractForm.contractType,
      employeeCode: this.contractForm.employeeCode.trim(),
      actualSalary: Number(this.contractForm.actualSalary),
      employmentType: this.contractForm.employmentType,
      startDate: this.contractForm.startDate,
      endDate: this.contractForm.endDate || null,
      signedDate: this.contractForm.signedDate || null,
      status: this.contractForm.status,
    };
    const operation = editingContract
      ? this.employeeService.updateContract(editingContract.id, request)
      : this.employeeService.createContract(request);
    operation.subscribe({
      next: () => {
        this.closeFormDialog();
        this.contractTable?.retry();
        this.toast.show({ severity: 'success', summary: editingContract ? 'Cập nhật hợp đồng thành công' : 'Thêm hợp đồng thành công', detail: `Hợp đồng ${request.contractNo} đã được lưu.` });
      },
    });
  }

  async deleteContract(contract: AdminContract): Promise<void> {
    const confirmed = await this.confirmService.confirm(
      'Xác nhận xóa hợp đồng',
      `Bạn có chắc muốn xóa hợp đồng "${contract.contractNo}" không?`,
      { type: 'danger', okText: 'Xóa' },
    );
    if (!confirmed) return;
    this.employeeService.deleteContract(contract.id).subscribe({
      next: () => {
        this.contractTable?.retry();
        this.toast.show({ severity: 'success', summary: 'Đã xóa hợp đồng', detail: `Hợp đồng ${contract.contractNo} đã được xóa.` });
      },
    });
  }

  contractStatusType(status: string): 'success' | 'warning' | 'error' {
    if (status === 'Sắp hết hạn') return 'warning';
    if (status === 'Đã hết hạn') return 'error';
    return 'success';
  }

  private searchContracts(query: SsDtQuery): Observable<SsDtPage<AdminContract>> {
    return this.employeeService.searchContracts({
      page: query.pageIndex - 1,
      size: query.pageSize,
      search: query.search || undefined,
      sorts: query.sort.map((sort) => `${sort.key},${sort.order}`),
      status: query.filter['status'] || undefined,
      employmentType: query.filter['employmentType'] || undefined,
    }).pipe(
      map((response) => {
        const rows = (response.data?.content ?? []).map((contract) => this.toAdminContract(contract));
        this.contracts.set(rows);
        this.contractTableSettings.cardStatusLabel = `${response.data?.totalElements ?? 0} hợp đồng`;
        return { data: rows, total: response.data?.totalElements ?? 0 };
      }),
    );
  }

  private toAdminContract(contract: EmployeeContractResponse): AdminContract {
    return {
      id: contract.id,
      contractNo: contract.contractNo,
      contractType: contract.contractType,
      employeeCode: contract.employeeCode,
      fullName: contract.fullName,
      department: contract.departmentName ?? contract.departmentCode ?? 'Chưa cập nhật',
      position: contract.positionName ?? contract.positionCode ?? 'Chưa cập nhật',
      actualSalary: contract.actualSalary,
      employmentType: contract.employmentType,
      startDate: this.formatDate(contract.startDate),
      endDate: contract.endDate ? this.formatDate(contract.endDate) : 'Không xác định thời hạn',
      signedDate: contract.signedDate ? this.formatDate(contract.signedDate) : 'Chưa cập nhật',
      status: contract.status,
    };
  }

  private emptyContractForm(): ContractForm {
    return {
      contractNo: '',
      contractType: 'Xác định thời hạn 12 tháng',
      employeeCode: '',
      actualSalary: 0,
      employmentType: 'Toàn thời gian',
      startDate: '',
      endDate: '',
      signedDate: '',
      status: 'Đang hiệu lực',
    };
  }

  private toInputDate(value: string): string {
    if (!value || value === 'Không xác định thời hạn' || value === 'Chưa cập nhật') return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const [day, month, year] = value.split('/');
    return year ? `${year}-${month}-${day}` : value;
  }

  private formatDate(value: string): string {
    if (!value) return 'Chưa cập nhật';
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value;
    const [year, month, day] = value.slice(0, 10).split('-');
    return year && month && day ? `${day}/${month}/${year}` : value;
  }
}
