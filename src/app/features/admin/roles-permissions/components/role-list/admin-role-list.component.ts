import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  SsButtonComponent,
  SsConfirmService,
  SsDataTableComponent,
  SsDialogComponent,
  SsDtActionClick,
  SsDtButton,
  SsDtColumn,
  SsDtConfig,
  SsToastService,
} from '@platform/ui-kit';
import { AdminRole, AdminRoleStatus } from '../../models/admin-role.model';
import { AdminRoleService } from '../../services/admin-role.service';

interface RoleForm {
  code: string;
  name: string;
  description: string;
  status: AdminRoleStatus;
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
  private readonly roleService = inject(AdminRoleService);
  private readonly confirmService = inject(SsConfirmService);
  private readonly toast = inject(SsToastService);

  @Output() readonly permissionsRequested = new EventEmitter<string>();

  readonly roles = this.roleService.roles;
  readonly roleDialogVisible = signal(false);
  readonly editingRole = signal<AdminRole | null>(null);
  readonly roleForm: RoleForm = this.emptyRoleForm();

  readonly roleColumns: SsDtColumn<AdminRole>[] = [
    { key: 'code', header: 'Mã vai trò', field: 'code', width: '140px', sortable: true, filterable: true },
    { key: 'name', header: 'Tên vai trò', field: 'name', width: '190px', sortable: true, filterable: true },
    { key: 'description', header: 'Mô tả', field: 'description', width: '310px', filterable: true },
    { key: 'userCount', header: 'Người dùng', format: (row) => `${row.userCount} người`, width: '125px', align: 'right', sortable: true },
    { key: 'permissionCount', header: 'Số quyền', format: (row) => `${row.permissionCount} quyền`, width: '115px', align: 'right', sortable: true },
    { key: 'status', header: 'Trạng thái', field: 'status', type: 'status', width: '145px', options: [{ label: 'Đang hoạt động', value: 'Đang hoạt động', color: '#32b36b' }, { label: 'Tạm khóa', value: 'Tạm khóa', color: '#8c8c8c' }] },
    { key: 'updatedAt', header: 'Cập nhật', field: 'updatedAt', width: '120px', sortable: true },
  ];

  roleTableSettings: SsDtConfig<AdminRole> = {
    rowKey: 'id',
    title: 'Vai trò',
    description: 'Quản lý nhóm truy cập và phạm vi sử dụng trong hệ thống',
    cardIcon: 'safety',
    cardStatusLabel: `${this.roles().length} vai trò`,
    cardStatusType: 'info',
    primaryButtons: [{ key: 'create-role', label: 'Thêm vai trò', type: 'primary', icon: 'plus' }],
    searchable: true,
    searchPlaceholder: 'Tìm theo mã, tên hoặc mô tả vai trò',
    showSort: true,
    showFilter: true,
    showSetting: true,
    showPagination: true,
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    rowActions: [
      { key: 'permissions', label: 'Phân quyền', icon: 'lock' },
      { key: 'edit', label: 'Sửa', icon: 'edit' },
      { key: 'delete', label: 'Xóa', icon: 'delete', danger: true, visible: (row) => !['ADMIN', 'EMPLOYEE'].includes(row.code) },
    ],
    quickFilters: [
      { key: 'status', placeholder: 'Tất cả trạng thái', options: [{ label: 'Đang hoạt động', value: 'Đang hoạt động' }, { label: 'Tạm khóa', value: 'Tạm khóa' }] },
    ],
    striped: true,
    size: 'small',
    scrollX: '1080px',
    emptyText: 'Không có vai trò phù hợp',
  };

  onPrimaryClick(button: SsDtButton): void {
    if (button.key !== 'create-role') return;
    Object.assign(this.roleForm, this.emptyRoleForm());
    this.editingRole.set(null);
    this.roleDialogVisible.set(true);
  }

  onActionClick(event: SsDtActionClick<AdminRole>): void {
    if (event.action.key === 'permissions') {
      this.permissionsRequested.emit(event.row.code);
      return;
    }
    if (event.action.key === 'edit') {
      Object.assign(this.roleForm, { code: event.row.code, name: event.row.name, description: event.row.description, status: event.row.status });
      this.editingRole.set(event.row);
      this.roleDialogVisible.set(true);
      return;
    }
    if (event.action.key === 'delete') void this.deleteRole(event.row);
  }

  closeRoleDialog(): void {
    this.roleDialogVisible.set(false);
  }

  saveRole(formValid: boolean): void {
    if (!formValid) return;
    const code = this.roleForm.code.trim().toUpperCase().replace(/\s+/g, '_');
    const name = this.roleForm.name.trim();
    const editingRole = this.editingRole();
    if (this.roles().some((role) => role.id !== editingRole?.id && role.code.toLowerCase() === code.toLowerCase())) {
      this.toast.show({ severity: 'warning', summary: 'Mã vai trò đã tồn tại', detail: 'Vui lòng sử dụng một mã vai trò khác.' });
      return;
    }
    const role: AdminRole = {
      id: editingRole?.id ?? Date.now(),
      code,
      name,
      description: this.roleForm.description.trim(),
      userCount: editingRole?.userCount ?? 0,
      permissionCount: editingRole?.permissionCount ?? 0,
      status: this.roleForm.status,
      updatedAt: '07/10/2025',
    };
    this.roles.update((roles) => editingRole ? roles.map((item) => item.id === editingRole.id ? role : item) : [...roles, role]);
    if (!editingRole) this.roleService.rolePermissions.update((permissions) => ({ ...permissions, [code]: [] }));
    this.roleTableSettings = { ...this.roleTableSettings, cardStatusLabel: `${this.roles().length} vai trò` };
    this.closeRoleDialog();
    this.toast.show({ severity: 'success', summary: editingRole ? 'Đã cập nhật vai trò' : 'Đã thêm vai trò', detail: `Vai trò ${name} đã được ${editingRole ? 'cập nhật' : 'tạo mới'}.` });
  }

  private async deleteRole(role: AdminRole): Promise<void> {
    const confirmed = await this.confirmService.confirm('Xác nhận xóa vai trò', `Bạn có chắc muốn xóa vai trò "${role.name}" không?`, { type: 'danger', okText: 'Xóa' });
    if (!confirmed) return;
    this.roles.update((roles) => roles.filter((item) => item.id !== role.id));
    this.roleService.rolePermissions.update((permissions) => {
      const next = { ...permissions };
      delete next[role.code];
      return next;
    });
    this.roleTableSettings = { ...this.roleTableSettings, cardStatusLabel: `${this.roles().length} vai trò` };
    this.toast.show({ severity: 'success', summary: 'Đã xóa vai trò', detail: `Vai trò ${role.name} đã được xóa.` });
  }

  private emptyRoleForm(): RoleForm {
    return { code: '', name: '', description: '', status: 'Đang hoạt động' };
  }
}
