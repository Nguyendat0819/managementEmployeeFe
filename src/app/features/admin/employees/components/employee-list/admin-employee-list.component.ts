import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable, map } from 'rxjs';
import { SsButtonComponent, SsConfirmService, SsDataTableComponent, SsDialogComponent, SsDtActionClick, SsDtButton, SsDtColumn, SsDtConfig, SsDtPage, SsDtQuery, SsStatComponent, SsTagComponent, SsToastService } from '@platform/ui-kit';
import { AdminEmployee, EmployeeRequest, EmployeeResponse } from '../../models/admin-employee.model';
import { AdminEmployeeService } from '../../services/admin-employee.service';
import { DepartmentResponse } from '../../../organization/models/response.model';
import { OrgUnitService } from '../../../organization/services/org-unit.service';
import { PositionOption } from '../../../roles-permissions/models/admin-role.model';
import { AdminRoleService } from '../../../roles-permissions/services/admin-role.service';

@Component({
  selector: 'app-admin-employee-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SsButtonComponent, SsDataTableComponent, SsDialogComponent, SsStatComponent, SsTagComponent],
  templateUrl: './admin-employee-list.component.html',
  styleUrl: './admin-employee-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminEmployeeListComponent implements OnInit {
  @ViewChild(SsDataTableComponent) private employeeTable?: SsDataTableComponent<AdminEmployee>;

  private readonly employeeService = inject(AdminEmployeeService);
  private readonly orgUnitService = inject(OrgUnitService);
  private readonly roleService = inject(AdminRoleService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly toast = inject(SsToastService);
  private readonly confirmService = inject(SsConfirmService);

  readonly employees = signal<AdminEmployee[]>([]);
  readonly totalEmployees = signal(0);
  readonly selectedEmployee = signal<AdminEmployee | null>(null);
  readonly detailVisible = signal(false);
  readonly createVisible = signal(false);
  readonly editingEmployee = signal<AdminEmployee | null>(null);
  readonly employeeForm = this.emptyEmployeeForm();
  genders = ['Nam', 'Nữ', 'Khác'];
  employmentTypes = ['Toàn thời gian', 'Bán thời gian', 'Thử việc'];
  statuses = ['Đang làm việc', 'Đang thử việc', 'Tạm nghỉ'];
  departments: DepartmentResponse[] = [];
  positions: PositionOption[] = [];
  readonly employeeColumns: SsDtColumn<AdminEmployee>[] = [
    { key: 'employeeCode', header: 'Mã nhân viên', field: 'employeeCode', width: '132px', sortable: true },
    { key: 'fullName', header: 'Họ và tên', field: 'fullName', width: '190px', sortable: true },
    { key: 'department', header: 'Phòng ban', field: 'department', width: '205px', sortable: false },
    { key: 'position', header: 'Chức danh', field: 'position', width: '210px', sortable: false },
    { key: 'employmentType', header: 'Loại hình', field: 'employmentType', width: '135px' },
    { key: 'hireDate', header: 'Ngày vào làm', field: 'hireDate', width: '125px', sortable: true },
    { key: 'status', header: 'Trạng thái', field: 'status', type: 'status', width: '140px', options: [
      { label: 'Đang làm việc', value: 'Đang làm việc', color: '#52c41a' },
      { label: 'Đang thử việc', value: 'Đang thử việc', color: '#1677ff' },
      { label: 'Tạm nghỉ', value: 'Tạm nghỉ', color: '#faad14' },
    ] },
  ];
  employeeTableSettings: SsDtConfig<AdminEmployee> = {
    rowKey: 'id',
    title: 'Danh sách hồ sơ nhân sự',
    description: 'Quản lý thông tin cá nhân, công việc và trạng thái làm việc',
    cardIcon: 'team',
    cardStatusLabel: '0 nhân sự',
    cardStatusType: 'info',
    searchable: true,
    searchPlaceholder: 'Tìm theo mã, họ tên, phòng ban hoặc chức danh',
    showSort: true,
    showFilter: false,
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
    quickFilters: [{ key: 'status', placeholder: 'Tất cả trạng thái', options: [
      { label: 'Đang làm việc', value: 'Đang làm việc' },
      { label: 'Đang thử việc', value: 'Đang thử việc' },
      { label: 'Tạm nghỉ', value: 'Tạm nghỉ' },
    ] }, {
      key: 'employmentType', placeholder: 'Tất cả loại hình', options: [
        { label: 'Toàn thời gian', value: 'Toàn thời gian' },
        { label: 'Bán thời gian', value: 'Bán thời gian' },
        { label: 'Thử việc', value: 'Thử việc' },
      ],
    }],
    dataSource: (query) => this.searchEmployees(query),
    striped: true,
    size: 'small',
    emptyText: 'Không có hồ sơ nhân sự phù hợp',
  };

  ngOnInit(): void {
    this.orgUnitService.getDepartments().subscribe({
      next: (response) => {
        this.departments = (response.data ?? []).filter((department) => !department.isDeleted);
        this.refreshQuickFilters();
        this.changeDetectorRef.markForCheck();
      },
    });
    this.employeeService.getCatalogs().subscribe({
      next: (response) => {
        this.genders = response.data?.genders?.length ? response.data.genders : this.genders;
        this.employmentTypes = response.data?.employmentTypes?.length ? response.data.employmentTypes : this.employmentTypes;
        this.statuses = response.data?.statuses?.length ? response.data.statuses : this.statuses;
        this.refreshQuickFilters();
        this.changeDetectorRef.markForCheck();
      },
    });
    this.loadPositions();
  }

  onPrimaryClick(button: SsDtButton): void {
    if (button.key === 'create-employee') this.openCreateDialog();
  }

  onActionClick(event: SsDtActionClick<AdminEmployee>): void {
    if (event.action.key === 'detail') {
      this.employeeService.getEmployee(event.row.id).subscribe({
        next: (response) => {
          this.selectedEmployee.set(this.toAdminEmployee(response.data));
          this.detailVisible.set(true);
          this.changeDetectorRef.markForCheck();
        },
      });
    } else if (event.action.key === 'edit') {
      this.openEditDialog(event.row);
    } else if (event.action.key === 'delete') {
      void this.deleteEmployee(event.row);
    }
  }

  closeDetail(): void { this.detailVisible.set(false); }
  get workingCount(): number { return this.employees().filter((employee) => employee.status === 'Đang làm việc').length; }
  get probationCount(): number { return this.employees().filter((employee) => employee.status === 'Đang thử việc').length; }
  get expiringCount(): number {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 60);
    return this.employees().filter((employee) => employee.contractEnd !== 'Chưa cập nhật'
      && new Date(employee.contractEnd) >= new Date()
      && new Date(employee.contractEnd) <= deadline).length;
  }

  openCreateDialog(): void {
    Object.assign(this.employeeForm, this.emptyEmployeeForm());
    this.editingEmployee.set(null);
    this.loadPositions();
    this.createVisible.set(true);
  }

  openEditDialog(employee: AdminEmployee): void {
    this.loadPositions();
    Object.assign(this.employeeForm, {
      employeeCode: employee.employeeCode,
      fullName: employee.fullName,
      birthDate: employee.birthDate === 'Chưa cập nhật' ? '' : employee.birthDate,
      gender: employee.gender === 'Chưa cập nhật' ? '' : employee.gender,
      idCard: employee.idCard === 'Chưa cập nhật' ? '' : employee.idCard,
      phone: employee.phone === 'Chưa cập nhật' ? '' : employee.phone,
      email: employee.email === 'Chưa cập nhật' ? '' : employee.email,
      departmentCode: employee.departmentCode,
      positionCode: employee.positionCode,
      employmentType: employee.employmentType,
      hireDate: employee.hireDate,
      contractEnd: employee.contractEnd === 'Chưa cập nhật' ? '' : employee.contractEnd,
      status: employee.status,
    });
    this.editingEmployee.set(employee);
    this.createVisible.set(true);
  }

  closeCreateDialog(): void { this.createVisible.set(false); }

  saveEmployee(formValid: boolean): void {
    if (!formValid) return;
    const editingEmployee = this.editingEmployee();
    const request: EmployeeRequest = {
      employeeCode: this.employeeForm.employeeCode.trim(),
      fullName: this.employeeForm.fullName.trim(),
      birthDate: this.employeeForm.birthDate || null,
      gender: this.employeeForm.gender || null,
      idCard: this.employeeForm.idCard.trim() || null,
      phone: this.employeeForm.phone.trim() || null,
      email: this.employeeForm.email.trim() || null,
      departmentCode: this.employeeForm.departmentCode,
      positionCode: this.employeeForm.positionCode,
      employmentType: this.employeeForm.employmentType,
      hireDate: this.employeeForm.hireDate,
      contractEnd: this.employeeForm.contractEnd || null,
      status: this.employeeForm.status,
    };
    const operation = editingEmployee
      ? this.employeeService.updateEmployee(editingEmployee.id, request)
      : this.employeeService.createEmployee(request);
    operation.subscribe({
      next: () => {
        this.closeCreateDialog();
        this.employeeTable?.retry();
        this.toast.show({ severity: 'success', summary: editingEmployee ? 'Cập nhật nhân viên thành công' : 'Thêm nhân viên thành công', detail: `Hồ sơ ${request.fullName} đã được lưu.` });
      },
    });
  }

  async deleteEmployee(employee: AdminEmployee): Promise<void> {
    const confirmed = await this.confirmService.confirm('Xác nhận xóa nhân viên',
      `Bạn có chắc muốn xóa hồ sơ của "${employee.fullName}" không?`, { type: 'danger', okText: 'Xóa' });
    if (!confirmed) return;
    this.employeeService.deleteEmployee(employee.id).subscribe({
      next: () => {
        this.employeeTable?.retry();
        this.toast.show({ severity: 'success', summary: 'Đã xóa nhân viên', detail: `Hồ sơ ${employee.fullName} đã được xóa.` });
      },
    });
  }

  initials(fullName: string): string { return fullName.split(' ').slice(-2).map((part) => part[0]).join(''); }

  private searchEmployees(query: SsDtQuery): Observable<SsDtPage<AdminEmployee>> {
    return this.employeeService.searchEmployees({
      page: query.pageIndex - 1,
      size: query.pageSize,
      search: query.search || undefined,
      sorts: query.sort.map((sort) => `${sort.key},${sort.order}`),
      departmentCode: query.filter['departmentCode'] || undefined,
      positionCode: query.filter['positionCode'] || undefined,
      status: query.filter['status'] || undefined,
      employmentType: query.filter['employmentType'] || undefined,
    }).pipe(
      map((response) => {
        const rows = (response.data?.content ?? []).map((employee) => this.toAdminEmployee(employee));
        const total = response.data?.totalElements ?? 0;
        this.employees.set(rows);
        this.totalEmployees.set(total);
        this.employeeTableSettings.cardStatusLabel = `${total} nhân sự`;
        return { data: rows, total };
      }),
    );
  }

  private loadPositions(): void {
    if (this.positions.length) return;
    this.roleService.getPositions().subscribe({
      next: (response) => {
        this.positions = response.data ?? [];
        this.refreshQuickFilters();
        this.changeDetectorRef.markForCheck();
      },
    });
  }

  private refreshQuickFilters(): void {
    this.employeeTableSettings = {
      ...this.employeeTableSettings,
      quickFilters: [
        { key: 'status', placeholder: 'Tất cả trạng thái', options: [
          ...this.statuses.map((status) => ({ label: status, value: status })),
        ] },
        { key: 'departmentCode', placeholder: 'Tất cả phòng ban', options: this.departments.map((department) => ({
          label: department.name,
          value: department.deptCode,
        })) },
        { key: 'positionCode', placeholder: 'Tất cả chức danh', options: this.positions.map((position) => ({
          label: position.title,
          value: position.positionCode,
        })) },
        { key: 'employmentType', placeholder: 'Tất cả loại hình', options: [
          ...this.employmentTypes.map((type) => ({ label: type, value: type })),
        ] },
      ],
    };
  }

  private toAdminEmployee(employee: EmployeeResponse): AdminEmployee {
    return {
      id: employee.id,
      employeeCode: employee.employeeCode,
      fullName: employee.fullName,
      birthDate: employee.birthDate ?? 'Chưa cập nhật',
      gender: employee.gender ?? 'Chưa cập nhật',
      idCard: employee.idCard ?? 'Chưa cập nhật',
      phone: employee.phone ?? 'Chưa cập nhật',
      email: employee.email ?? 'Chưa cập nhật',
      department: employee.departmentName ?? employee.departmentCode ?? 'Chưa cập nhật',
      departmentCode: employee.departmentCode ?? '',
      position: employee.positionName ?? employee.positionCode ?? 'Chưa cập nhật',
      positionCode: employee.positionCode ?? '',
      employmentType: employee.employmentType,
      hireDate: employee.hireDate,
      contractEnd: employee.contractEnd ?? 'Chưa cập nhật',
      status: employee.status,
    };
  }

  private emptyEmployeeForm() {
    return {
      employeeCode: '', fullName: '', birthDate: '', gender: '', idCard: '', phone: '', email: '',
      departmentCode: '', positionCode: '', employmentType: 'Toàn thời gian', hireDate: '',
      contractEnd: '', status: 'Đang làm việc',
    };
  }
}
