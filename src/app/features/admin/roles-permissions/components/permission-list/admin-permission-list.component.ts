import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from '@angular/core';
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
  SsTransferComponent,
  SsTransferItem,
} from '@platform/ui-kit';
import { AdminRoleService } from '../../services/admin-role.service';

interface PermissionForm {
  code: string;
  name: string;
  description: string;
}

@Component({
  selector: 'app-admin-permission-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SsButtonComponent, SsDataTableComponent, SsDialogComponent, SsTransferComponent],
  templateUrl: './admin-permission-list.component.html',
  styleUrl: './admin-permission-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPermissionListComponent implements OnChanges {
  private readonly roleService = inject(AdminRoleService);
  private readonly confirmService = inject(SsConfirmService);
  private readonly toast = inject(SsToastService);

  @Input() activeRoleCode = 'ADMIN';
  @Output() readonly activeRoleCodeChange = new EventEmitter<string>();

  readonly roles = this.roleService.roles;
  readonly permissionCatalog = this.roleService.permissions;
  readonly selectedPermissions = signal<SsTransferItem[]>([]);
  readonly permissionResults = signal<SsTransferItem[]>(this.permissionCatalog());
  readonly permissionDialogVisible = signal(false);
  readonly editingPermission = signal<SsTransferItem | null>(null);
  readonly permissionForm: PermissionForm = this.emptyPermissionForm();
  permissionKeyword = '';

  readonly permissionColumns: SsDtColumn<SsTransferItem>[] = [
    { key: 'value', header: 'Mã quyền', field: 'value', width: '190px', sortable: true, filterable: true },
    { key: 'label', header: 'Tên quyền', field: 'label', width: '250px', sortable: true, filterable: true },
    { key: 'description', header: 'Mô tả', field: 'description', width: '420px', filterable: true },
  ];

  permissionTableSettings: SsDtConfig<SsTransferItem> = {
    rowKey: 'value',
    title: 'Danh mục quyền',
    description: 'Tạo và quản lý các quyền có thể gán cho vai trò',
    cardIcon: 'lock',
    cardStatusLabel: `${this.permissionCatalog().length} quyền`,
    cardStatusType: 'info',
    primaryButtons: [{ key: 'create-permission', label: 'Thêm quyền', type: 'primary', icon: 'plus' }],
    searchable: true,
    searchPlaceholder: 'Tìm theo mã, tên hoặc mô tả quyền',
    showSort: true,
    showFilter: false,
    showSetting: true,
    showPagination: true,
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    rowActions: [
      { key: 'edit', label: 'Sửa', icon: 'edit' },
      { key: 'delete', label: 'Xóa', icon: 'delete', danger: true },
    ],
    striped: true,
    size: 'small',
    scrollX: '760px',
    emptyText: 'Chưa có quyền nào được khai báo',
  };

  constructor() {
    this.loadPermissionsForRole(this.activeRoleCode);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activeRoleCode'] && !changes['activeRoleCode'].firstChange) this.loadPermissionsForRole(this.activeRoleCode);
  }

  onRoleChange(roleCode: string): void {
    this.activeRoleCode = roleCode;
    this.activeRoleCodeChange.emit(roleCode);
    this.loadPermissionsForRole(roleCode);
  }

  onPermissionSearch(keyword: string): void {
    this.permissionKeyword = keyword.trim().toLowerCase();
    this.filterPermissionResults();
  }

  onPermissionChange(items: SsTransferItem[]): void {
    this.selectedPermissions.set(items);
  }

  savePermissions(): void {
    const roleCode = this.activeRoleCode;
    this.roleService.rolePermissions.update((permissions) => ({ ...permissions, [roleCode]: this.selectedPermissions().map((permission) => permission.value) }));
    this.roleService.roles.update((roles) => roles.map((role) => role.code === roleCode ? { ...role, permissionCount: this.selectedPermissions().length, updatedAt: '07/10/2025' } : role));
    this.toast.show({ severity: 'success', summary: 'Đã lưu phân quyền', detail: `Vai trò ${this.roleName(roleCode)} đã được cập nhật quyền truy cập.` });
  }

  onPermissionPrimaryClick(button: SsDtButton): void {
    if (button.key !== 'create-permission') return;
    Object.assign(this.permissionForm, this.emptyPermissionForm());
    this.editingPermission.set(null);
    this.permissionDialogVisible.set(true);
  }

  onPermissionActionClick(event: SsDtActionClick<SsTransferItem>): void {
    if (event.action.key === 'edit') {
      Object.assign(this.permissionForm, { code: event.row.value, name: event.row.label, description: event.row.description ?? '' });
      this.editingPermission.set(event.row);
      this.permissionDialogVisible.set(true);
      return;
    }
    if (event.action.key === 'delete') void this.deletePermission(event.row);
  }

  closePermissionDialog(): void {
    this.permissionDialogVisible.set(false);
  }

  savePermission(formValid: boolean): void {
    if (!formValid) return;
    const code = this.permissionForm.code.trim().toLowerCase().replace(/\s+/g, '.');
    const name = this.permissionForm.name.trim();
    const editingPermission = this.editingPermission();
    if (this.permissionCatalog().some((permission) => permission.value !== editingPermission?.value && permission.value.toLowerCase() === code.toLowerCase())) {
      this.toast.show({ severity: 'warning', summary: 'Mã quyền đã tồn tại', detail: 'Vui lòng sử dụng một mã quyền khác.' });
      return;
    }
    const permission: SsTransferItem = { value: code, label: name, description: this.permissionForm.description.trim() };
    this.permissionCatalog.update((permissions) => editingPermission
      ? permissions.map((item) => item.value === editingPermission.value ? permission : item)
      : [...permissions, permission]);
    if (editingPermission) this.selectedPermissions.update((permissions) => permissions.map((item) => item.value === editingPermission.value ? permission : item));
    this.filterPermissionResults();
    this.refreshPermissionTableStatus();
    this.closePermissionDialog();
    this.toast.show({ severity: 'success', summary: editingPermission ? 'Đã cập nhật quyền' : 'Đã thêm quyền', detail: `Quyền ${name} đã được ${editingPermission ? 'cập nhật' : 'tạo mới'}.` });
  }

  roleName(roleCode: string): string {
    return this.roles().find((role) => role.code === roleCode)?.name ?? roleCode;
  }

  private loadPermissionsForRole(roleCode: string): void {
    const selectedValues = new Set(this.roleService.rolePermissions()[roleCode] ?? []);
    this.selectedPermissions.set(this.permissionCatalog().filter((permission) => selectedValues.has(permission.value)));
    this.permissionKeyword = '';
    this.permissionResults.set(this.permissionCatalog());
  }

  private filterPermissionResults(): void {
    if (!this.permissionKeyword) {
      this.permissionResults.set(this.permissionCatalog());
      return;
    }
    this.permissionResults.set(this.permissionCatalog().filter((permission) => `${permission.label} ${permission.description} ${permission.value}`.toLowerCase().includes(this.permissionKeyword)));
  }

  private async deletePermission(permission: SsTransferItem): Promise<void> {
    const assignedRoleCount = this.roles().filter((role) => (this.roleService.rolePermissions()[role.code] ?? []).includes(permission.value)).length;
    const confirmed = await this.confirmService.confirm(
      'Xác nhận xóa quyền',
      `Bạn có chắc muốn xóa quyền "${permission.label}" không?${assignedRoleCount ? ` Quyền này đang được cấp cho ${assignedRoleCount} vai trò.` : ''}`,
      { type: 'danger', okText: 'Xóa' },
    );
    if (!confirmed) return;
    this.permissionCatalog.update((permissions) => permissions.filter((item) => item.value !== permission.value));
    this.roleService.rolePermissions.update((permissions) => {
      const next = { ...permissions };
      Object.keys(next).forEach((roleCode) => { next[roleCode] = (next[roleCode] ?? []).filter((code) => code !== permission.value); });
      return next;
    });
    this.selectedPermissions.update((permissions) => permissions.filter((item) => item.value !== permission.value));
    this.roleService.roles.update((roles) => roles.map((role) => ({ ...role, permissionCount: (this.roleService.rolePermissions()[role.code] ?? []).length })));
    this.filterPermissionResults();
    this.refreshPermissionTableStatus();
    this.toast.show({ severity: 'success', summary: 'Đã xóa quyền', detail: `Quyền ${permission.label} đã được xóa khỏi danh mục.` });
  }

  private refreshPermissionTableStatus(): void {
    this.permissionTableSettings = { ...this.permissionTableSettings, cardStatusLabel: `${this.permissionCatalog().length} quyền` };
  }

  private emptyPermissionForm(): PermissionForm {
    return { code: '', name: '', description: '' };
  }
}
