import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Output, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable, map } from 'rxjs';
import {
  SsButtonComponent,
  SsConfirmService,
  SsDataTableComponent,
  SsDialogComponent,
  SsDtActionClick,
  SsDtButton,
  SsDtColumn,
  SsDtConfig,
  SsDtPage,
  SsDtQuery,
  SsToastService,
} from '@platform/ui-kit';
import { AdminRole, RoleCreateRequest, RoleResponse, RoleUpdateRequest } from '../../models/admin-role.model';
import { AdminRoleService } from '../../services/admin-role.service';

interface RoleForm {
  code: string;
  name: string;
  description: string;
}

@Component({
  selector: 'app-admin-role-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SsButtonComponent, SsDataTableComponent, SsDialogComponent],
  templateUrl: './admin-role-list.component.html',
  styleUrl: './admin-role-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminRoleListComponent {
  @ViewChild(SsDataTableComponent) private roleTable?: SsDataTableComponent<AdminRole>;

  private readonly roleService = inject(AdminRoleService);
  private readonly confirmService = inject(SsConfirmService);
  private readonly toast = inject(SsToastService);

  @Output() readonly permissionsRequested = new EventEmitter<string>();

  readonly roles = this.roleService.roles;
  readonly totalRoles = this.roleService.totalRoles;
  readonly selectedRole = signal<AdminRole | null>(null);
  readonly detailVisible = signal(false);
  readonly roleDialogVisible = signal(false);
  readonly editingRole = signal<AdminRole | null>(null);
  readonly roleForm: RoleForm = this.emptyRoleForm();

  readonly roleColumns: SsDtColumn<AdminRole>[] = [
    { key: 'roleCode', header: 'Mã vai trò', field: 'code', width: '140px', sortable: true },
    { key: 'roleName', header: 'Tên vai trò', field: 'name', width: '190px', sortable: true },
    { key: 'description', header: 'Mô tả', field: 'description', width: '310px', sortable: true },
    { key: 'userCount', header: 'Người dùng', format: (row) => `${row.userCount} người`, width: '125px', align: 'right', sortable: true },
    { key: 'permissionCount', header: 'Số quyền', format: (row) => `${row.permissionCount} quyền`, width: '115px', align: 'right', sortable: true },
    { key: 'isDeleted', header: 'Trạng thái', field: 'status', type: 'status', width: '145px', sortable: true, options: [
      { label: 'Đang hoạt động', value: 'Đang hoạt động', color: '#32b36b' },
      { label: 'Đã xóa', value: 'Đã xóa', color: '#8c8c8c' },
    ] },
    { key: 'updatedAt', header: 'Cập nhật', field: 'updatedAt', width: '120px', sortable: true },
  ];

  roleTableSettings: SsDtConfig<AdminRole> = {
    rowKey: 'id',
    title: 'Vai trò',
    description: 'Quản lý nhóm truy cập và phạm vi sử dụng trong hệ thống',
    cardIcon: 'safety',
    cardStatusLabel: '0 vai trò',
    cardStatusType: 'info',
    primaryButtons: [{ key: 'create-role', label: 'Thêm vai trò', type: 'primary', icon: 'plus' }],
    searchable: true,
    searchPlaceholder: 'Tìm theo mã, tên hoặc mô tả vai trò',
    showSort: true,
    showFilter: false,
    showSetting: true,
    showPagination: true,
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    rowActions: [
      { key: 'detail', label: 'Xem chi tiết', icon: 'eye' },
      { key: 'permissions', label: 'Phân quyền', icon: 'lock', visible: (row) => row.status === 'Đang hoạt động' },
      { key: 'edit', label: 'Sửa', icon: 'edit', visible: (row) => row.status === 'Đang hoạt động' },
      { key: 'delete', label: 'Xóa', icon: 'delete', danger: true, visible: (row) => row.status === 'Đang hoạt động' && !['ADMIN', 'EMPLOYEE'].includes(row.code) },
    ],
    quickFilters: [{
      key: 'isDeleted',
      placeholder: 'Tất cả trạng thái',
      value: 'false',
      options: [
        { label: 'Đang hoạt động', value: 'false' },
        { label: 'Đã xóa', value: 'true' },
      ],
    }],
    dataSource: (query) => this.searchRoles(query),
    striped: true,
    size: 'small',
    scrollX: '1160px',
    emptyText: 'Không có vai trò phù hợp',
  };

  onPrimaryClick(button: SsDtButton): void {
    if (button.key !== 'create-role') return;
    Object.assign(this.roleForm, this.emptyRoleForm());
    this.editingRole.set(null);
    this.roleDialogVisible.set(true);
  }

  onActionClick(event: SsDtActionClick<AdminRole>): void {
    if (event.action.key === 'detail') {
      this.openDetail(event.row.id);
      return;
    }
    if (event.action.key === 'permissions') {
      this.permissionsRequested.emit(event.row.code);
      return;
    }
    if (event.action.key === 'edit') {
      this.openEditDialog(event.row.id);
      return;
    }
    if (event.action.key === 'delete') void this.deleteRole(event.row);
  }

  closeDetail(): void {
    this.detailVisible.set(false);
  }

  closeRoleDialog(): void {
    this.roleDialogVisible.set(false);
  }

  saveRole(formValid: boolean): void {
    if (!formValid) return;
    const editingRole = this.editingRole();
    const code = this.roleForm.code.trim().toUpperCase().replace(/\s+/g, '_');
    const name = this.roleForm.name.trim();
    const description = this.roleForm.description.trim() || null;
    const operation = editingRole
      ? this.roleService.updateRole(editingRole.id, { roleName: name, description } satisfies RoleUpdateRequest)
      : this.roleService.createRole({ roleCode: code, roleName: name, description } satisfies RoleCreateRequest);

    operation.subscribe({
      next: () => {
        if (!editingRole) {
          this.roleService.rolePermissions.update((permissions) => ({ ...permissions, [code]: [] }));
        }
        this.closeRoleDialog();
        this.roleTable?.retry();
        this.toast.show({
          severity: 'success',
          summary: editingRole ? 'Đã cập nhật vai trò' : 'Đã thêm vai trò',
          detail: `Vai trò ${name} đã được ${editingRole ? 'cập nhật' : 'tạo mới'}.`,
        });
      },
    });
  }

  private openDetail(id: number): void {
    this.roleService.getRole(id).subscribe({
      next: (response) => {
        this.selectedRole.set(this.toAdminRole(response.data));
        this.detailVisible.set(true);
      },
    });
  }

  private openEditDialog(id: number): void {
    this.roleService.getRole(id).subscribe({
      next: (response) => {
        const role = this.toAdminRole(response.data);
        Object.assign(this.roleForm, {
          code: role.code,
          name: role.name,
          description: response.data.description ?? '',
        });
        this.editingRole.set(role);
        this.roleDialogVisible.set(true);
      },
    });
  }

  private async deleteRole(role: AdminRole): Promise<void> {
    const confirmed = await this.confirmService.confirm(
      'Xác nhận xóa vai trò',
      `Bạn có chắc muốn xóa vai trò "${role.name}" không?`,
      { type: 'danger', okText: 'Xóa' },
    );
    if (!confirmed) return;
    this.roleService.deleteRole(role.id).subscribe({
      next: () => {
        this.roleService.rolePermissions.update((permissions) => {
          const next = { ...permissions };
          delete next[role.code];
          return next;
        });
        this.roleTable?.retry();
        this.toast.show({ severity: 'success', summary: 'Đã xóa vai trò', detail: `Vai trò ${role.name} đã được xóa.` });
      },
    });
  }

  private searchRoles(query: SsDtQuery): Observable<SsDtPage<AdminRole>> {
    const deletedFilter = query.filter['isDeleted'];
    const isDeleted = deletedFilter === 'true' ? true : deletedFilter === 'false' ? false : undefined;
    return this.roleService.searchRoles({
      page: query.pageIndex - 1,
      size: query.pageSize,
      search: query.search || undefined,
      sorts: query.sort.map((sort) => `${sort.key},${sort.order}`),
      isDeleted,
    }).pipe(
      map((response) => {
        const rows = (response.data?.content ?? []).map((role) => this.toAdminRole(role));
        const total = response.data?.totalElements ?? 0;
        this.roles.set(rows);
        this.totalRoles.set(total);
        this.roleTableSettings.cardStatusLabel = `${total} vai trò`;
        return { data: rows, total };
      }),
    );
  }

  private toAdminRole(role: RoleResponse): AdminRole {
    return {
      id: role.id,
      code: role.roleCode,
      name: role.roleName,
      description: role.description ?? 'Chưa cập nhật',
      userCount: role.userCount,
      permissionCount: role.permissionCount,
      status: role.isDeleted ? 'Đã xóa' : 'Đang hoạt động',
      updatedAt: this.formatDate(role.updatedAt ?? role.createdAt),
    };
  }

  private formatDate(value: string | null | undefined): string {
    if (!value) return 'Chưa cập nhật';
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    }).format(date);
  }

  private emptyRoleForm(): RoleForm {
    return { code: '', name: '', description: '' };
  }
}
