import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SsButtonComponent, SsConfirmService, SsDataTableComponent, SsDialogComponent, SsDtActionClick, SsDtButton, SsDtColumn, SsDtConfig, SsStatComponent, SsTagComponent, SsToastService } from '@platform/ui-kit';
import { AdminEmployee } from '../../models/admin-employee.model';
import { AdminEmployeeService } from '../../services/admin-employee.service';

@Component({
  selector: 'app-admin-employee-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SsButtonComponent, SsDataTableComponent, SsDialogComponent, SsStatComponent, SsTagComponent],
  templateUrl: './admin-employee-list.component.html',
  styleUrl: './admin-employee-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminEmployeeListComponent {
  private readonly employeeService = inject(AdminEmployeeService);
  private readonly toast = inject(SsToastService);
  private readonly confirmService = inject(SsConfirmService);

  readonly employees = signal(this.employeeService.employees);
  readonly selectedEmployee = signal<AdminEmployee | null>(null);
  readonly detailVisible = signal(false);
  readonly createVisible = signal(false);
  readonly editingEmployee = signal<AdminEmployee | null>(null);
  readonly employeeForm = this.emptyEmployeeForm();
  readonly employeeColumns: SsDtColumn<AdminEmployee>[] = [
    { key: 'employeeCode', header: 'Mã nhân viên', field: 'employeeCode', width: '132px', sortable: true, filterable: true },
    { key: 'fullName', header: 'Họ và tên', field: 'fullName', width: '190px', sortable: true, filterable: true },
    { key: 'department', header: 'Phòng ban', field: 'department', width: '205px', filterable: true },
    { key: 'position', header: 'Chức danh', field: 'position', width: '210px', filterable: true },
    { key: 'employmentType', header: 'Loại hình', field: 'employmentType', width: '135px', filterable: true },
    { key: 'hireDate', header: 'Ngày vào làm', field: 'hireDate', width: '125px', sortable: true },
    {
      key: 'status',
      header: 'Trạng thái',
      field: 'status',
      type: 'status',
      width: '140px',
      options: [
        { label: 'Đang làm việc', value: 'Đang làm việc', color: '#52c41a' },
        { label: 'Đang thử việc', value: 'Đang thử việc', color: '#1677ff' },
        { label: 'Tạm nghỉ', value: 'Tạm nghỉ', color: '#faad14' },
      ],
    },
  ];
  employeeTableSettings: SsDtConfig<AdminEmployee> = {
    rowKey: 'id',
    title: 'Danh sách hồ sơ nhân sự',
    description: 'Quản lý thông tin cá nhân, công việc và trạng thái làm việc',
    cardIcon: 'team',
    cardStatusLabel: `${this.employees().length} nhân sự`,
    cardStatusType: 'info',
    searchable: true,
    searchPlaceholder: 'Tìm theo mã, họ tên, phòng ban hoặc chức danh',
    showSort: true,
    showFilter: true,
    showSetting: true,
    showPagination: true,
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    primaryButtons: [{ key: 'create-employee', label: 'Thêm mới', type: 'primary', icon: 'plus' }],
    rowActions: [
      { key: 'detail', label: 'Xem hồ sơ', icon: 'eye' },
      { key: 'edit', label: 'Sửa', icon: 'edit' },
      { key: 'delete', label: 'Xóa', icon: 'delete', danger: true },
    ],
    quickFilters: [
      { key: 'status', placeholder: 'Tất cả trạng thái', options: [
        { label: 'Đang làm việc', value: 'Đang làm việc' },
        { label: 'Đang thử việc', value: 'Đang thử việc' },
        { label: 'Tạm nghỉ', value: 'Tạm nghỉ' },
      ] },
      { key: 'departmentCode', placeholder: 'Tất cả phòng ban', options: [
        { label: 'Công nghệ thông tin', value: 'IT' },
        { label: 'Kinh doanh', value: 'SALE' },
        { label: 'Nhân sự', value: 'HR' },
        { label: 'Tài chính - Kế toán', value: 'FIN' },
        { label: 'Marketing', value: 'MKT' },
        { label: 'Vận hành', value: 'OPS' },
      ] },
    ],
    striped: true,
    size: 'small',
    emptyText: 'Không có hồ sơ nhân sự phù hợp',
  };

  onPrimaryClick(button: SsDtButton): void {
    if (button.key === 'create-employee') this.openCreateDialog();
  }

  onActionClick(event: SsDtActionClick<AdminEmployee>): void {
    if (event.action.key === 'detail') {
      this.selectedEmployee.set(event.row);
      this.detailVisible.set(true);
      return;
    }
    if (event.action.key === 'edit') {
      this.openEditDialog(event.row);
      return;
    }
    if (event.action.key === 'delete') void this.deleteEmployee(event.row);
  }

  closeDetail(): void {
    this.detailVisible.set(false);
  }

  get workingCount(): number {
    return this.employees().filter((employee) => employee.status === 'Đang làm việc').length;
  }

  get probationCount(): number {
    return this.employees().filter((employee) => employee.status === 'Đang thử việc').length;
  }

  openCreateDialog(): void {
    Object.assign(this.employeeForm, this.emptyEmployeeForm());
    this.editingEmployee.set(null);
    this.createVisible.set(true);
  }

  openEditDialog(employee: AdminEmployee): void {
    Object.assign(this.employeeForm, {
      employeeCode: employee.employeeCode,
      fullName: employee.fullName,
      birthDate: employee.birthDate === 'Chưa cập nhật' ? '' : employee.birthDate,
      phone: employee.phone === 'Chưa cập nhật' ? '' : employee.phone,
      email: employee.email === 'Chưa cập nhật' ? '' : employee.email,
      department: employee.department,
      position: employee.position,
      employmentType: employee.employmentType,
      hireDate: employee.hireDate,
      status: employee.status,
    });
    this.editingEmployee.set(employee);
    this.createVisible.set(true);
  }

  closeCreateDialog(): void {
    this.createVisible.set(false);
  }

  saveEmployee(formValid: boolean): void {
    if (!formValid) return;

    const employeeCode = this.employeeForm.employeeCode.trim();
    const fullName = this.employeeForm.fullName.trim();
    const editingEmployee = this.editingEmployee();
    if (this.employees().some((employee) => employee.id !== editingEmployee?.id && employee.employeeCode.toLowerCase() === employeeCode.toLowerCase())) {
      this.toast.show({ severity: 'warning', summary: 'Mã nhân viên đã tồn tại', detail: 'Vui lòng sử dụng một mã nhân viên khác.' });
      return;
    }

    const employee: AdminEmployee = {
      id: editingEmployee?.id ?? Date.now(),
      employeeCode,
      fullName,
      birthDate: this.employeeForm.birthDate || 'Chưa cập nhật',
      gender: 'Chưa cập nhật',
      idCard: 'Chưa cập nhật',
      phone: this.employeeForm.phone.trim() || 'Chưa cập nhật',
      email: this.employeeForm.email.trim() || 'Chưa cập nhật',
      department: this.employeeForm.department,
      departmentCode: this.departmentCodeOf(this.employeeForm.department),
      position: this.employeeForm.position.trim(),
      employmentType: this.employeeForm.employmentType,
      hireDate: this.employeeForm.hireDate,
      contractEnd: 'Chưa cập nhật',
      status: this.employeeForm.status,
    };

    this.employees.update((employees) => editingEmployee
      ? employees.map((item) => item.id === editingEmployee.id ? employee : item)
      : [...employees, employee]);
    this.employeeTableSettings = { ...this.employeeTableSettings, cardStatusLabel: `${this.employees().length} nhân sự` };
    this.closeCreateDialog();
    this.toast.show({
      severity: 'success',
      summary: editingEmployee ? 'Cập nhật nhân viên thành công' : 'Thêm nhân viên thành công',
      detail: `Hồ sơ ${fullName} đã được ${editingEmployee ? 'cập nhật' : 'thêm vào danh sách'}.`,
    });
  }

  async deleteEmployee(employee: AdminEmployee): Promise<void> {
    const confirmed = await this.confirmService.confirm(
      'Xác nhận xóa nhân viên',
      `Bạn có chắc muốn xóa hồ sơ của "${employee.fullName}" không?`,
      { type: 'danger', okText: 'Xóa' },
    );
    if (!confirmed) return;

    this.employees.update((employees) => employees.filter((item) => item.id !== employee.id));
    this.employeeTableSettings = { ...this.employeeTableSettings, cardStatusLabel: `${this.employees().length} nhân sự` };
    this.toast.show({ severity: 'success', summary: 'Đã xóa nhân viên', detail: `Hồ sơ ${employee.fullName} đã được xóa khỏi danh sách.` });
  }

  initials(fullName: string): string {
    return fullName.split(' ').slice(-2).map((part) => part[0]).join('');
  }

  private emptyEmployeeForm() {
    return {
      employeeCode: '',
      fullName: '',
      birthDate: '',
      phone: '',
      email: '',
      department: 'Phòng Công nghệ thông tin',
      position: '',
      employmentType: 'Toàn thời gian',
      hireDate: '',
      status: 'Đang làm việc',
    };
  }

  private departmentCodeOf(department: string): string {
    return {
      'Phòng Công nghệ thông tin': 'IT',
      'Phòng Kinh doanh': 'SALE',
      'Phòng Nhân sự': 'HR',
      'Phòng Tài chính - Kế toán': 'FIN',
      'Phòng Marketing': 'MKT',
      'Phòng Vận hành': 'OPS',
    }[department] ?? 'OTHER';
  }
}
