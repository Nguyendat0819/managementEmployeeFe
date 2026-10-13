import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import {
  SsConfirmService,
  SsToastService,
  SsTreeTableAction,
  SsTreeTableActionClickEvent,
  SsTreeTableColumn,
  SsTreeTableComponent,
  SsTreeTableConfig,
  SsTreeTableNode,
  SsTreeTableQueryChangeEvent,
  SsTreeTableToolbarActionEvent,
  SsTreeTableToolbarPrimaryAction,
} from '@platform/ui-kit';
import { finalize } from 'rxjs';
import { DepartmentCreateRequest, DepartmentFormValue, DepartmentUpdateRequest, OrganizationFormMode } from '../../models/request.model';
import { DepartmentResponse, EmployeeResponse, OrganizationTreeRow } from '../../models/response.model';
import { DepartmentQuery, OrgUnitService } from '../../services/org-unit.service';
import { OrgUnitFormComponent } from '../org-unit-form/org-unit-form.component';

@Component({
  selector: 'app-org-unit-list',
  standalone: true,
  imports: [CommonModule, SsTreeTableComponent, OrgUnitFormComponent],
  templateUrl: './org-unit-list.component.html',
  styleUrl: './org-unit-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrgUnitListComponent implements OnInit {
  private readonly orgUnitService = inject(OrgUnitService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly confirmService = inject(SsConfirmService);
  private readonly toast = inject(SsToastService);

  departments: DepartmentResponse[] = [];
  nodes: SsTreeTableNode<OrganizationTreeRow>[] = [];
  loading = false;
  formOpen = false;
  formMode: OrganizationFormMode = 'create';
  formDepartment: DepartmentResponse | null = null;
  formParentDepartment: DepartmentResponse | null = null;
  employees: EmployeeResponse[] = [];
  employeesLoading = false;
  employeesDepartment: DepartmentResponse | null = null;
  employeesOpen = false;
  private currentQuery: DepartmentQuery = {};

  readonly primaryActions: SsTreeTableToolbarPrimaryAction[] = [
    { key: 'create', label: 'Thêm mới', icon: 'plus', type: 'primary' },
  ];

  readonly rowActions: SsTreeTableAction<OrganizationTreeRow>[] = [
    { key: 'create-child', label: 'Thêm đơn vị con', icon: 'plus' },
    { key: 'view', label: 'Xem', icon: 'eye' },
    { key: 'employees', label: 'Xem nhân sự', icon: 'user' },
    { key: 'edit', label: 'Sửa', icon: 'edit' },
    { key: 'delete', label: 'Xóa', icon: 'delete', danger: true },
  ];

  readonly columns: SsTreeTableColumn<OrganizationTreeRow>[] = [
    { key: 'name', title: 'Tên đơn vị', type: 'tree', width: 270, minWidth: 220, sortable: true },
    { key: 'deptCode', title: 'Mã phòng ban', field: 'deptCode', width: 150, minWidth: 120, sortable: true },
    { key: 'code', title: 'Mã đơn vị', field: 'code', width: 150, minWidth: 120, sortable: true },
    { key: 'parentCode', title: 'Đơn vị cha', field: 'parentCode', width: 160, minWidth: 130 },
    { key: 'headCode', title: 'Mã phụ trách', field: 'headCode', width: 150, minWidth: 130 },
    { key: 'level', title: 'Cấp', field: 'level', width: 80, minWidth: 70, align: 'center', sortable: true },
    { key: 'employeeCount', title: 'Nhân sự', field: 'employeeCount', width: 120, minWidth: 100, align: 'right', formatter: (value) => `${value ?? 0} người` },
    {
      key: 'status',
      title: 'Trạng thái',
      type: 'status',
      field: 'statusLabel',
      width: 140,
      minWidth: 120,
      options: [
        { label: 'Đang hoạt động', value: 'Đang hoạt động', color: '#52c41a' },
        { label: 'Đã xóa', value: 'Đã xóa', color: '#ff4d4f' },
      ],
    },
    { key: 'actions', title: 'Thao tác', type: 'actions', align: 'center', width: 96, actions: this.rowActions },
  ];

  readonly config: SsTreeTableConfig<OrganizationTreeRow> = {
    title: 'Quản lý cây đơn vị tổ chức',
    showCard: true,
    showHeader: true,
    showCheckbox: false,
    showNodeIcon: true,
    showContextMenu: true,
    expandOnLabelClick: true,
    striped: true,
    hoverable: true,
    queryMode: 'server',
    emptyText: 'Không có dữ liệu đơn vị tổ chức',
    columns: { resizable: true, defaultWidth: '160px', minWidth: 96, maxWidth: 720 },
    toolbar: {
      search: {
        visible: true,
        placeholder: 'Tìm theo mã, tên, tên viết tắt rồi nhấn Enter...',
        mode: 'server',
        trigger: 'input',
        clearable: true,
      },
      filter: { mode: 'server' },
      sort: { mode: 'client' },
      settings: { visible: true, badge: false },
      primary: true,
      primaryActions: this.primaryActions,
      quickFilters: [
        {
          key: 'level',
          placeholder: 'Tất cả cấp tổ chức',
          options: [1, 2, 3, 4, 5].map((level) => ({ label: `Cấp ${level}`, value: level })),
        },
        {
          key: 'statusLabel',
          placeholder: 'Tất cả trạng thái',
          options: [
            { label: 'Đang hoạt động', value: 'Đang hoạt động' },
            { label: 'Đã xóa', value: 'Đã xóa' },
          ],
        },
      ],
    },
    pagination: { visible: false },
  };

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.loading = true;
    this.orgUnitService.getDepartments(this.currentQuery).subscribe({
      next: (response) => {
        this.departments = response.data ?? [];
        this.refreshNodes();
        this.loading = false;
        this.changeDetectorRef.markForCheck();
      },
      error: () => {
        this.departments = [];
        this.nodes = [];
        this.loading = false;
        this.changeDetectorRef.markForCheck();
      },
    });
  }

  onQueryChange(event: SsTreeTableQueryChangeEvent): void {
    const filters = new Map(event.filters.map((filter) => [filter.key, filter.value]));
    const levelValue = filters.get('level');
    const statusValue = filters.get('statusLabel');
    const level = typeof levelValue === 'number' ? levelValue : Number(levelValue);

    this.currentQuery = {
      search: event.search || undefined,
      level: Number.isFinite(level) && level > 0 ? level : undefined,
      isDeleted: statusValue === 'Đã xóa'
        ? true
        : statusValue === 'Đang hoạt động'
          ? false
          : undefined,
    };
    this.loadDepartments();
  }

  onToolbarAction(event: SsTreeTableToolbarActionEvent): void {
    const key = event.actionKey ?? event.action?.key;
    if (event.type === 'primary' && key === 'create') this.openForm('create');
  }

  onActionClick(event: SsTreeTableActionClickEvent<OrganizationTreeRow>): void {
    const department = this.departments.find((item) => item.deptCode === event.key);
    if (!department) return;

    switch (event.action.key) {
      case 'create-child':
        this.openForm('child', null, department);
        break;
      case 'view':
        this.openForm('view', department);
        break;
      case 'employees':
        this.loadEmployees(department);
        break;
      case 'edit':
        this.openForm('edit', department);
        break;
      case 'delete':
        void this.deleteDepartment(department);
        break;
    }
  }

  onFormSave(value: DepartmentFormValue): void {
    const request: DepartmentCreateRequest | DepartmentUpdateRequest = this.formDepartment
      ? { name: value.name, level: value.level }
      : {
          deptCode: value.deptCode,
          parentCode: value.parentCode || null,
          name: value.name,
          code: value.code,
          headCode: value.headCode || null,
          level: value.level,
        };

    this.loading = true;
    const request$ = this.formDepartment
      ? this.orgUnitService.updateDepartment(this.formDepartment.deptCode, request as DepartmentUpdateRequest)
      : this.orgUnitService.createDepartment(request as DepartmentCreateRequest);

    request$.pipe(finalize(() => this.loading = false)).subscribe({
      next: () => {
        this.toast.show({
          severity: 'success',
          summary: 'Thành công',
          detail: this.formDepartment ? 'Đã cập nhật đơn vị.' : 'Đã thêm đơn vị.',
        });
        this.closeForm();
        this.loadDepartments();
      },
    });
  }

  closeForm(): void {
    this.formOpen = false;
    this.formDepartment = null;
    this.formParentDepartment = null;
    this.changeDetectorRef.markForCheck();
  }

  private openForm(mode: OrganizationFormMode, department: DepartmentResponse | null = null, parent: DepartmentResponse | null = null): void {
    this.formMode = mode;
    this.formDepartment = department;
    this.formParentDepartment = parent;
    this.formOpen = true;
    this.changeDetectorRef.markForCheck();
  }

  private async deleteDepartment(department: DepartmentResponse): Promise<void> {
    const confirmed = await this.confirmService.confirm(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa mềm đơn vị "${department.name}" không?`,
      { type: 'danger', okText: 'Xóa' },
    );
    if (!confirmed) return;

    this.loading = true;
    this.orgUnitService.deleteDepartment(department.deptCode)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.toast.show({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa mềm đơn vị.' });
          this.loadDepartments();
        },
      });
  }

  private loadEmployees(department: DepartmentResponse): void {
    this.employeesDepartment = department;
    this.employeesOpen = true;
    this.employeesLoading = true;
    this.employees = [];
    this.orgUnitService.getEmployeesByDepartment(department.deptCode)
      .pipe(finalize(() => this.employeesLoading = false))
      .subscribe({
        next: (response) => {
          this.employees = response.data ?? [];
          this.changeDetectorRef.markForCheck();
        },
      });
  }

  closeEmployees(): void {
    this.employeesOpen = false;
    this.employeesDepartment = null;
    this.employees = [];
    this.changeDetectorRef.markForCheck();
  }

  private refreshNodes(): void {
    this.nodes = this.buildNodes(this.departments);
  }

  private buildNodes(items: DepartmentResponse[]): SsTreeTableNode<OrganizationTreeRow>[] {
    const existingCodes = new Set(items.map((department) => department.deptCode));
    const visibleItems = items.map((department) => ({
      ...department,
      parentCode: department.parentCode && existingCodes.has(department.parentCode)
        ? department.parentCode
        : null,
    }));
    const visibleChildrenByParent = new Map<string | null, DepartmentResponse[]>();
    for (const department of visibleItems) {
      visibleChildrenByParent.set(
        department.parentCode,
        [...(visibleChildrenByParent.get(department.parentCode) ?? []), department],
      );
    }

    const buildVisibleChildren = (parentCode: string | null): SsTreeTableNode<OrganizationTreeRow>[] =>
      (visibleChildrenByParent.get(parentCode) ?? []).map((department) => {
        const children = buildVisibleChildren(department.deptCode);
        return {
          ...this.toNode(department),
          type: children.length ? 'folder' : 'leaf',
          expanded: false,
          children,
        };
      });

    return buildVisibleChildren(null);
  }

  private toNode(department: DepartmentResponse): SsTreeTableNode<OrganizationTreeRow> {
    return {
      key: department.deptCode,
      label: department.name,
      type: 'leaf',
      status: department.isDeleted ? 'inactive' : 'active',
      data: {
        deptCode: department.deptCode,
        parentCode: department.parentCode ?? '—',
        code: department.code,
        headCode: department.headCode ?? '—',
        level: department.level,
        employeeCount: department.employeeCount,
        statusLabel: department.isDeleted ? 'Đã xóa' : 'Đang hoạt động',
      },
    };
  }
}
