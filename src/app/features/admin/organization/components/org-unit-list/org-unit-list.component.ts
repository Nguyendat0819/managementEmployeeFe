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
  SsTreeTableToolbarActionEvent,
  SsTreeTableToolbarPrimaryAction,
} from '@platform/ui-kit';
import { DepartmentFormValue, OrganizationFormMode } from '../../models/request.model';
import { DepartmentResponse, OrganizationTreeRow } from '../../models/response.model';
import { OrgUnitService } from '../../services/org-unit.service';
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

  readonly primaryActions: SsTreeTableToolbarPrimaryAction[] = [
    { key: 'create', label: 'Thêm mới', icon: 'plus', type: 'primary' },
  ];

  readonly rowActions: SsTreeTableAction<OrganizationTreeRow>[] = [
    { key: 'create-child', label: 'Thêm đơn vị con', icon: 'plus' },
    { key: 'view', label: 'Xem', icon: 'eye' },
    { key: 'edit', label: 'Sửa', icon: 'edit' },
    { key: 'relocate', label: 'Chuyển đơn vị', icon: 'swap' },
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
    queryMode: 'client',
    emptyText: 'Không có dữ liệu đơn vị tổ chức',
    columns: { resizable: true, defaultWidth: '160px', minWidth: 96, maxWidth: 720 },
    toolbar: {
      search: {
        visible: true,
        placeholder: 'Tìm theo mã, tên, tên viết tắt rồi nhấn Enter...',
        mode: 'client',
        trigger: 'input',
        clearable: true,
      },
      filter: true,
      sort: true,
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
    this.orgUnitService.getDepartments().subscribe({
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
      case 'edit':
        this.openForm('edit', department);
        break;
      case 'relocate':
        this.openForm('relocate', department);
        break;
      case 'delete':
        void this.deleteMockDepartment(department);
        break;
    }
  }

  onFormSave(value: DepartmentFormValue): void {
    if (this.formMode === 'relocate') {
      this.departments = this.departments.map((department) => department.deptCode === this.formDepartment?.deptCode
        ? { ...department, parentCode: value.parentCode.trim() || null }
        : department);
      this.toast.show({ severity: 'success', summary: 'Thành công', detail: 'Đã chuyển đơn vị trong dữ liệu mock.' });
      this.closeForm();
      this.refreshNodes();
      return;
    }

    if (this.departments.some((department) => department.deptCode === value.deptCode && department.deptCode !== this.formDepartment?.deptCode)) {
      return;
    }

    const department: DepartmentResponse = {
      id: this.formDepartment?.id ?? Date.now(),
      deptCode: value.deptCode,
      parentCode: value.parentCode || null,
      name: value.name,
      code: value.code,
      headCode: value.headCode || null,
      level: value.level,
      isDeleted: value.isDeleted,
      employeeCount: this.formDepartment?.employeeCount ?? 0,
    };

    if (this.formDepartment) {
      const previousCode = this.formDepartment.deptCode;
      this.departments = this.departments.map((item) => item.deptCode === previousCode ? department : item);
      if (previousCode !== department.deptCode) {
        this.departments = this.departments.map((item) => item.parentCode === previousCode
          ? { ...item, parentCode: department.deptCode }
          : item);
      }
      this.toast.show({ severity: 'success', summary: 'Thành công', detail: 'Đã cập nhật đơn vị mock.' });
    } else {
      this.departments = [...this.departments, department];
      this.toast.show({ severity: 'success', summary: 'Thành công', detail: 'Đã thêm đơn vị mock.' });
    }

    this.closeForm();
    this.refreshNodes();
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

  private async deleteMockDepartment(department: DepartmentResponse): Promise<void> {
    if (this.departments.some((item) => item.parentCode === department.deptCode)) {
      this.toast.show({ severity: 'warning', summary: 'Không thể xóa', detail: 'Đơn vị vẫn còn đơn vị con.' });
      return;
    }
    if (department.employeeCount > 0) {
      this.toast.show({ severity: 'warning', summary: 'Không thể xóa', detail: 'Đơn vị vẫn còn nhân sự.' });
      return;
    }

    const confirmed = await this.confirmService.confirm(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa đơn vị "${department.name}" khỏi dữ liệu mock không?`,
      { type: 'danger', okText: 'Xóa' },
    );
    if (!confirmed) return;

    this.departments = this.departments.filter((item) => item.deptCode !== department.deptCode);
    this.refreshNodes();
    this.toast.show({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa đơn vị khỏi dữ liệu mock.' });
    this.changeDetectorRef.markForCheck();
  }

  private refreshNodes(): void {
    this.nodes = this.buildNodes(this.departments);
  }

  private buildNodes(items: DepartmentResponse[]): SsTreeTableNode<OrganizationTreeRow>[] {
    const childrenByParent = new Map<string | null, DepartmentResponse[]>();
    for (const department of items) {
      const parent = department.parentCode || null;
      childrenByParent.set(parent, [...(childrenByParent.get(parent) ?? []), department]);
    }

    const buildChildren = (parentCode: string | null): SsTreeTableNode<OrganizationTreeRow>[] =>
      (childrenByParent.get(parentCode) ?? []).map((department) => {
        const children = buildChildren(department.deptCode);
        return {
          ...this.toNode(department),
          type: children.length ? 'folder' : 'leaf',
          expanded: false,
          children,
        };
      });

    return buildChildren(null);
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
