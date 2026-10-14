import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
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
import { PermissionCreateRequest, PermissionResponse, PermissionUpdateRequest } from '../../models/admin-permission.model';

interface PermissionForm {
  code: string;
  name: string;
  description: string;
}

interface PermissionItem extends SsTransferItem {
  id: number;
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
  readonly permissionCatalog = signal<PermissionItem[]>([]);
  readonly selectedPermissions = signal<SsTransferItem[]>([]);
  readonly permissionResults = signal<SsTransferItem[]>([]);
  readonly permissionDialogVisible = signal(false);
  readonly editingPermission = signal<PermissionItem | null>(null);
  readonly savingPermissions = signal(false);
  readonly savingPermission = signal(false);
  readonly permissionForm: PermissionForm = this.emptyPermissionForm();
  permissionKeyword = '';

  readonly permissionColumns: SsDtColumn<PermissionItem>[] = [
    { key: 'value', header: 'Mã quyền', field: 'value', width: '190px', sortable: true, filterable: true },
    { key: 'label', header: 'Tên quyền', field: 'label', width: '250px', sortable: true, filterable: true },
    { key: 'description', header: 'Mô tả', field: 'description', width: '420px', filterable: true },
  ];

  permissionTableSettings: SsDtConfig<PermissionItem> = {
    rowKey: 'id',
    title: 'Danh mục quyền',
    description: 'Tạo và quản lý các quyền có thể gán cho vai trò',
    cardIcon: 'lock',
    cardStatusLabel: '0 quyền',
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
    this.loadPermissionCatalog();
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
    this.permissionKeyword = keyword.trim();
    this.roleService.searchPermissions({ page: 0, size: 200, search: this.permissionKeyword || undefined, isDeleted: false }).subscribe({
      next: (response) => this.permissionResults.set((response.data?.content ?? []).map((item) => this.toPermissionItem(item))),
    });
  }

  onPermissionTableSearch(keyword: string): void {
    const search = keyword.trim();
    this.roleService.searchPermissions({ page: 0, size: 200, search: search || undefined, isDeleted: false }).subscribe({
      next: (response) => {
        const items = (response.data?.content ?? []).map((item) => this.toPermissionItem(item));
        this.permissionCatalog.set(items);
        this.permissionResults.set(items);
        this.permissionTableSettings = { ...this.permissionTableSettings, cardStatusLabel: `${response.data?.totalElements ?? items.length} quyền` };
      },
    });
  }

  onPermissionChange(items: SsTransferItem[]): void {
    this.selectedPermissions.set(items);
  }

  savePermissions(): void {
    if (this.savingPermissions()) return;

    const roleCode = this.activeRoleCode;
    const permissionCodes = this.selectedPermissions().map((permission) => permission.value);
    const savedPermissionCodes = this.roleService.rolePermissions()[roleCode] ?? [];
    if (this.hasSamePermissionCodes(savedPermissionCodes, permissionCodes)) {
      this.toast.show({ severity: 'info', summary: 'Không có thay đổi', detail: 'Danh sách phân quyền chưa thay đổi.' });
      return;
    }

    this.savingPermissions.set(true);
    this.roleService.updateRolePermissions(roleCode, permissionCodes).pipe(
      finalize(() => this.savingPermissions.set(false)),
    ).subscribe({
      next: () => {
        this.roleService.rolePermissions.update((permissions) => ({ ...permissions, [roleCode]: permissionCodes }));
        this.roleService.roles.update((roles) => roles.map((role) => role.code === roleCode
          ? { ...role, permissionCount: permissionCodes.length }
          : role));
        this.toast.show({ severity: 'success', summary: 'Đã lưu phân quyền', detail: `Vai trò ${this.roleName(roleCode)} đã được cập nhật quyền truy cập.` });
      },
    });
  }

  onPermissionPrimaryClick(button: SsDtButton): void {
    if (button.key !== 'create-permission') return;
    Object.assign(this.permissionForm, this.emptyPermissionForm());
    this.editingPermission.set(null);
    this.permissionDialogVisible.set(true);
  }

  onPermissionActionClick(event: SsDtActionClick<PermissionItem>): void {
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
    if (!formValid || this.savingPermission()) return;
    const code = this.permissionForm.code.trim().toLowerCase().replace(/\s+/g, '.');
    const name = this.permissionForm.name.trim();
    const description = this.permissionForm.description.trim() || null;
    const editingPermission = this.editingPermission();
    const operation = editingPermission
      ? this.roleService.updatePermission(editingPermission.id, { permissionName: name, description } satisfies PermissionUpdateRequest)
      : this.roleService.createPermission({ permissionCode: code, permissionName: name, description } satisfies PermissionCreateRequest);

    this.savingPermission.set(true);
    operation.pipe(finalize(() => this.savingPermission.set(false))).subscribe({
      next: (response) => {
        const savedPermission = response.data ? this.toPermissionItem(response.data) : null;
        if (savedPermission) {
          this.permissionCatalog.update((items) => editingPermission
            ? items.map((item) => item.id === savedPermission.id ? savedPermission : item)
            : [savedPermission, ...items]);
          this.permissionResults.set(this.permissionCatalog());
          this.permissionTableSettings = { ...this.permissionTableSettings, cardStatusLabel: `${this.permissionCatalog().length} quyền` };
        }
        this.closePermissionDialog();
        this.toast.show({ severity: 'success', summary: editingPermission ? 'Đã cập nhật quyền' : 'Đã thêm quyền', detail: `Quyền ${name} đã được ${editingPermission ? 'cập nhật' : 'tạo mới'}.` });
      },
    });
  }

  roleName(roleCode: string): string {
    return this.roles().find((role) => role.code === roleCode)?.name ?? roleCode;
  }

  private loadPermissionCatalog(): void {
    this.roleService.searchPermissions({ page: 0, size: 200, isDeleted: false }).subscribe({
      next: (response) => {
        const items = (response.data?.content ?? []).map((item) => this.toPermissionItem(item));
        this.permissionCatalog.set(items);
        this.permissionResults.set(items);
        this.permissionTableSettings = { ...this.permissionTableSettings, cardStatusLabel: `${response.data?.totalElements ?? items.length} quyền` };
        this.loadPermissionsForRole(this.activeRoleCode);
      },
    });
  }

  private loadPermissionsForRole(roleCode: string): void {
    this.roleService.getPermissionsByRole(roleCode).subscribe({
      next: (response) => {
        const selectedValues = new Set((response.data ?? []).flatMap((item) => item.permissions));
        this.roleService.rolePermissions.update((permissions) => ({ ...permissions, [roleCode]: [...selectedValues] }));
        this.selectedPermissions.set(this.permissionCatalog().filter((permission) => selectedValues.has(permission.value)));
        this.permissionKeyword = '';
        this.permissionResults.set(this.permissionCatalog());
      },
    });
  }

  private async deletePermission(permission: PermissionItem): Promise<void> {
    const confirmed = await this.confirmService.confirm(
      'Xác nhận xóa quyền',
      `Bạn có chắc muốn xóa quyền "${permission.label}" không? Quyền sẽ bị gỡ khỏi các vai trò đang được cấp.`,
      { type: 'danger', okText: 'Xóa' },
    );
    if (!confirmed) return;
    this.roleService.deletePermission(permission.id).subscribe({
      next: () => {
        this.roleService.rolePermissions.update((permissions) => Object.fromEntries(
          Object.entries(permissions).map(([roleCode, codes]) => [roleCode, codes.filter((code) => code !== permission.value)]),
        ));
        this.permissionCatalog.update((items) => items.filter((item) => item.id !== permission.id));
        this.permissionResults.set(this.permissionCatalog());
        this.permissionTableSettings = { ...this.permissionTableSettings, cardStatusLabel: `${this.permissionCatalog().length} quyền` };
        this.toast.show({ severity: 'success', summary: 'Đã xóa quyền', detail: `Quyền ${permission.label} đã được xóa khỏi danh mục.` });
      },
    });
  }

  private toPermissionItem(item: PermissionResponse): PermissionItem {
    return {
      id: item.id,
      value: item.permissionCode,
      label: item.permissionName,
      description: item.description ?? '',
    };
  }

  private emptyPermissionForm(): PermissionForm {
    return { code: '', name: '', description: '' };
  }

  private hasSamePermissionCodes(left: string[], right: string[]): boolean {
    if (left.length !== right.length) return false;
    const rightCodes = new Set(right);
    return left.every((code) => rightCodes.has(code));
  }
}
