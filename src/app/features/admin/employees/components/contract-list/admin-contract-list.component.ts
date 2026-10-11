import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SsButtonComponent, SsConfirmService, SsDataTableComponent, SsDialogComponent, SsDtActionClick, SsDtButton, SsDtColumn, SsDtConfig, SsStatComponent, SsTagComponent, SsToastService } from '@platform/ui-kit';
import { AdminContract } from '../../models/admin-employee.model';
import { AdminEmployeeService } from '../../services/admin-employee.service';

@Component({
  selector: 'app-admin-contract-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SsButtonComponent,
    SsDataTableComponent,
    SsDialogComponent,
    SsStatComponent,
    SsTagComponent,
  ],
  templateUrl: './admin-contract-list.component.html',
  styleUrl: './admin-contract-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminContractListComponent {
  private readonly employeeService = inject(AdminEmployeeService);
  private readonly toast = inject(SsToastService);
  private readonly confirmService = inject(SsConfirmService);

  readonly contracts = signal(this.employeeService.contracts);
  readonly selectedContract = signal<AdminContract | null>(null);
  readonly detailVisible = signal(false);
  readonly formVisible = signal(false);
  readonly editingContract = signal<AdminContract | null>(null);
  readonly contractForm = this.emptyContractForm();
  readonly contractColumns: SsDtColumn<AdminContract>[] = [
    {
      key: 'contractNo',
      header: 'Số hợp đồng',
      field: 'contractNo',
      width: '150px',
      sortable: true,
      filterable: true,
    },
    {
      key: 'employeeCode',
      header: 'Mã nhân viên',
      field: 'employeeCode',
      width: '130px',
      filterable: true,
    },
    {
      key: 'fullName',
      header: 'Nhân viên',
      field: 'fullName',
      width: '180px',
      sortable: true,
      filterable: true,
    },
    {
      key: 'contractType',
      header: 'Loại hợp đồng',
      field: 'contractType',
      width: '190px',
      filterable: true,
    },
    {
      key: 'department',
      header: 'Phòng ban',
      field: 'department',
      width: '190px',
      filterable: true,
    },
    {
      key: 'actualSalary',
      header: 'Lương thực nhận',
      type: 'number',
      format: (row) => `${new Intl.NumberFormat('vi-VN').format(row.actualSalary)} VNĐ`,
      width: '155px',
      align: 'right',
      sortable: true,
    },
    {
      key: 'startDate',
      header: 'Ngày bắt đầu',
      field: 'startDate',
      width: '125px',
      sortable: true,
    },
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
    cardStatusLabel: `${this.contracts().length} hợp đồng`,
    cardStatusType: 'info',
    searchable: true,
    searchPlaceholder: 'Tìm theo số hợp đồng, mã hoặc tên nhân viên',
    showSort: true,
    showFilter: true,
    showSetting: true,
    showPagination: true,
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    primaryButtons: [{ key: 'create-contract', label: 'Thêm mới', type: 'primary', icon: 'plus' }],
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
          { label: 'Thử việc', value: 'Thử việc' },
        ],
      },
    ],
    striped: true,
    size: 'small',
    emptyText: 'Không có hợp đồng phù hợp',
  };

  onPrimaryClick(button: SsDtButton): void {
    if (button.key === 'create-contract') this.openCreateDialog();
  }

  onActionClick(event: SsDtActionClick<AdminContract>): void {
    if (event.action.key === 'detail') {
      this.selectedContract.set(event.row);
      this.detailVisible.set(true);
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
    const average =
      this.contracts().reduce((total, contract) => total + contract.actualSalary, 0) /
      this.contracts().length /
      1000000;
    return average.toFixed(1).replace('.', ',');
  }

  openCreateDialog(): void {
    Object.assign(this.contractForm, this.emptyContractForm());
    this.editingContract.set(null);
    this.formVisible.set(true);
  }

  openEditDialog(contract: AdminContract): void {
    Object.assign(this.contractForm, {
      contractNo: contract.contractNo,
      contractType: contract.contractType,
      employeeCode: contract.employeeCode,
      fullName: contract.fullName,
      department: contract.department,
      position: contract.position,
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

    const contractNo = this.contractForm.contractNo.trim();
    const fullName = this.contractForm.fullName.trim();
    const editingContract = this.editingContract();
    if (
      this.contracts().some(
        (contract) =>
          contract.id !== editingContract?.id &&
          contract.contractNo.toLowerCase() === contractNo.toLowerCase(),
      )
    ) {
      this.toast.show({
        severity: 'warning',
        summary: 'Số hợp đồng đã tồn tại',
        detail: 'Vui lòng sử dụng một số hợp đồng khác.',
      });
      return;
    }

    const contract: AdminContract = {
      id: editingContract?.id ?? Date.now(),
      contractNo,
      contractType: this.contractForm.contractType,
      employeeCode: this.contractForm.employeeCode.trim(),
      fullName,
      department: this.contractForm.department.trim(),
      position: this.contractForm.position.trim(),
      actualSalary: Number(this.contractForm.actualSalary),
      employmentType: this.contractForm.employmentType,
      startDate: this.formatDate(this.contractForm.startDate),
      endDate: this.contractForm.endDate
        ? this.formatDate(this.contractForm.endDate)
        : 'Không xác định thời hạn',
      signedDate: this.formatDate(this.contractForm.signedDate),
      status: this.contractForm.status,
    };

    this.contracts.update((contracts) =>
      editingContract
        ? contracts.map((item) => (item.id === editingContract.id ? contract : item))
        : [...contracts, contract],
    );
    this.contractTableSettings = {
      ...this.contractTableSettings,
      cardStatusLabel: `${this.contracts().length} hợp đồng`,
    };
    this.closeFormDialog();
    this.toast.show({
      severity: 'success',
      summary: editingContract ? 'Cập nhật hợp đồng thành công' : 'Thêm hợp đồng thành công',
      detail: `Hợp đồng ${contractNo} đã được ${editingContract ? 'cập nhật' : 'thêm vào danh sách'}.`,
    });
  }

  async deleteContract(contract: AdminContract): Promise<void> {
    const confirmed = await this.confirmService.confirm(
      'Xác nhận xóa hợp đồng',
      `Bạn có chắc muốn xóa hợp đồng "${contract.contractNo}" không?`,
      { type: 'danger', okText: 'Xóa' },
    );
    if (!confirmed) return;

    this.contracts.update((contracts) => contracts.filter((item) => item.id !== contract.id));
    this.contractTableSettings = {
      ...this.contractTableSettings,
      cardStatusLabel: `${this.contracts().length} hợp đồng`,
    };
    this.toast.show({
      severity: 'success',
      summary: 'Đã xóa hợp đồng',
      detail: `Hợp đồng ${contract.contractNo} đã được xóa khỏi danh sách.`,
    });
  }

  contractStatusType(status: string): 'success' | 'warning' | 'error' {
    if (status === 'Sắp hết hạn') return 'warning';
    if (status === 'Đã hết hạn') return 'error';
    return 'success';
  }

  private emptyContractForm() {
    return {
      contractNo: '',
      contractType: 'Xác định thời hạn 12 tháng',
      employeeCode: '',
      fullName: '',
      department: '',
      position: '',
      actualSalary: 0,
      employmentType: 'Toàn thời gian',
      startDate: '',
      endDate: '',
      signedDate: '',
      status: 'Đang hiệu lực',
    };
  }

  private toInputDate(value: string): string {
    if (!value || value === 'Không xác định thời hạn') return '';
    const [day, month, year] = value.split('/');
    return year ? `${year}-${month}-${day}` : value;
  }

  private formatDate(value: string): string {
    const [year, month, day] = value.split('-');
    return day && month && year ? `${day}/${month}/${year}` : value;
  }
}
