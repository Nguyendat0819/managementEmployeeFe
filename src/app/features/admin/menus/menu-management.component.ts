import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { finalize } from 'rxjs';
import {
  SsConfirmService,
  SsDialogComponent,
  SsToastService,
  SsTreeTableAction,
  SsTreeTableActionClickEvent,
  SsTreeTableColumn,
  SsTreeTableComponent,
  SsTreeTableConfig,
} from '@platform/ui-kit';
import { MenuApiService, MenuPayload, MenuRecord } from '@core/menu/menu-api.service';
import { MenuService } from '@core/menu/menu.service';
import { AdminRoleService } from '../roles-permissions/services/admin-role.service';
import { RoleResponse } from '../roles-permissions/models/admin-role.model';

interface MenuRow extends MenuRecord { depth: number }

@Component({
  selector: 'app-menu-management',
  standalone: true,
  imports: [CommonModule, FormsModule, NzIconModule, SsDialogComponent, SsTreeTableComponent],
  templateUrl: './menu-management.component.html',
  styleUrl: './menu-management.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuManagementComponent implements OnInit {
  private readonly api = inject(MenuApiService);
  private readonly roleService = inject(AdminRoleService);
  private readonly menuService = inject(MenuService);
  private readonly confirm = inject(SsConfirmService);
  private readonly toast = inject(SsToastService);

  readonly menus = signal<MenuRecord[]>([]);
  readonly roles = signal<RoleResponse[]>([]);
  readonly selectedRole = signal('');
  readonly selectedCodes = signal<Set<string>>(new Set());
  readonly loadingMenus = signal(false);
  readonly loadingRoles = signal(false);
  readonly loadingAssignments = signal(false);
  readonly assignmentsLoaded = signal(false);
  readonly saving = signal(false);
  readonly savingAssignments = signal(false);
  readonly dialogVisible = signal(false);
  readonly editing = signal<MenuRecord | null>(null);

  form: MenuPayload = this.emptyForm();
  readonly iconOptions = [
    'user', 'home', 'bell', 'menu', 'setting', 'dashboard', 'apartment', 'team',
    'calendar', 'schedule', 'clock-circle', 'check', 'check-circle', 'audit',
    'solution', 'idcard', 'ordered-list', 'file-text', 'file-search', 'database',
    'calculator', 'dollar', 'safety', 'lock', 'folder', 'folder-open', 'appstore',
    'bank', 'line-chart', 'pie-chart', 'flag', 'fund', 'history',
    'key', 'mail', 'search', 'thunderbolt', 'cluster', 'question-circle',
  ];
  readonly colorPalette = [
    '#1677ff', '#0958d9', '#2f54eb', '#722ed1', '#eb2f96', '#f5222d',
    '#fa541c', '#fa8c16', '#faad14', '#fadb14', '#52c41a', '#13c2c2',
    '#08979c', '#8c8c8c', '#595959', '#262626',
  ];

  readonly rowActions: SsTreeTableAction<MenuRecord>[] = [
    { key: 'create-child', label: 'Thêm menu con', icon: 'plus' },
    { key: 'edit', label: 'Sửa', icon: 'edit' },
    { key: 'delete', label: 'Xóa', icon: 'delete', danger: true },
  ];
  readonly treeColumns: SsTreeTableColumn<MenuRecord>[] = [
    { key: 'label', title: 'Menu', type: 'tree', width: 260, minWidth: 180, sortable: true },
    { key: 'path', title: 'Đường dẫn', field: 'path', width: 240, minWidth: 160, formatter: value => String(value || 'Nhóm menu') },
    { key: 'sortOrder', title: 'Thứ tự', field: 'sortOrder', width: 90, minWidth: 70, align: 'center', sortable: true },
    { key: 'actions', title: 'Thao tác', type: 'actions', width: 100, minWidth: 88, align: 'center', actions: this.rowActions },
  ];
  readonly treeConfig: SsTreeTableConfig<MenuRecord> = {
    showCard: false,
    showHeader: false,
    showCheckbox: false,
    showNodeIcon: true,
    expandOnLabelClick: true,
    striped: true,
    hoverable: true,
    queryMode: 'client',
    rowKey: 'menuCode',
    parentKey: 'parentCode',
    labelKey: 'label',
    emptyText: 'Chưa có menu nào. Hãy thêm menu mới.',
    columns: { resizable: true, defaultWidth: '160px', minWidth: 80 },
    toolbar: {
      search: { visible: true, placeholder: 'Tìm menu...', mode: 'client', clearable: true },
      filter: false,
      sort: false,
      settings: false,
      primary: false,
    },
    pagination: { visible: false },
  };

  readonly groups = computed(() => this.menus());
  readonly treeData = computed(() => this.menus().map(menu => ({ ...menu, expanded: true })));
  readonly allRows = computed<MenuRow[]>(() => {
    const source = this.menus();
    const byCode = new Set(source.map(menu => menu.menuCode));
    const children = new Map<string | null, MenuRecord[]>();
    for (const menu of source) {
      const parentCode = menu.parentCode?.trim();
      const parent = parentCode && parentCode !== menu.menuCode && byCode.has(parentCode) ? parentCode : null;
      const siblings = children.get(parent) ?? [];
      siblings.push(menu);
      children.set(parent, siblings);
    }
    const rows: MenuRow[] = [];
    const visited = new Set<string>();
    const visit = (parent: string | null, depth: number): void => {
      for (const menu of (children.get(parent) ?? []).sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label))) {
        if (visited.has(menu.menuCode)) continue;
        visited.add(menu.menuCode);
        rows.push({ ...menu, depth });
        visit(menu.menuCode, depth + 1);
      }
    };
    visit(null, 0);
    for (const menu of source) {
      if (!visited.has(menu.menuCode)) {
        visited.add(menu.menuCode);
        rows.push({ ...menu, depth: 0 });
        visit(menu.menuCode, 1);
      }
    }
    return rows;
  });
  ngOnInit(): void {
    this.loadMenus();
    this.loadRoles(0, []);
  }

  loadMenus(): void {
    this.loadingMenus.set(true);
    this.api.list().pipe(finalize(() => this.loadingMenus.set(false))).subscribe({
      next: response => {
        const menus = response.data ?? [];
        this.menus.set(menus);
        const leafCodes = new Set(menus.filter(menu => !!menu.path).map(menu => menu.menuCode));
        this.selectedCodes.update(codes => new Set([...codes].filter(code => leafCodes.has(code))));
      },
    });
  }

  selectRole(code: string): void {
    this.selectedRole.set(code);
    this.selectedCodes.set(new Set());
    this.assignmentsLoaded.set(false);
    if (!code) return;
    this.loadingAssignments.set(true);
    this.api.roleMenus(code).pipe(finalize(() => this.loadingAssignments.set(false))).subscribe({
      next: response => {
        if (this.selectedRole() !== code) return;
        this.selectedCodes.set(new Set(response.data ?? []));
        this.assignmentsLoaded.set(true);
      },
    });
  }

  toggleMenu(code: string, checked: boolean): void {
    this.selectedCodes.update(current => {
      const next = new Set(current);
      if (checked) next.add(code);
      else next.delete(code);
      return next;
    });
  }

  onActionClick(event: SsTreeTableActionClickEvent<MenuRecord>): void {
    const menu = this.menus().find(item => item.menuCode === String(event.key));
    if (!menu) return;
    if (event.action.key === 'create-child') {
      this.openCreate(menu.menuCode);
      return;
    }
    if (event.action.key === 'edit') this.openEdit(menu);
    if (event.action.key === 'delete') void this.deleteMenu(menu);
  }

  selectIcon(icon: string): void {
    this.form.icon = icon;
  }

  selectColor(color: string | null): void {
    this.form.iconColor = color;
  }

  saveAssignments(): void {
    const roleCode = this.selectedRole();
    if (!roleCode || !this.assignmentsLoaded() || this.savingAssignments()) return;
    this.savingAssignments.set(true);
    this.api.saveRoleMenus(roleCode, [...this.selectedCodes()])
      .pipe(finalize(() => this.savingAssignments.set(false)))
      .subscribe({
        next: () => {
          this.menuService.loadCurrentMenu();
          this.toast.show({ severity: 'success', summary: 'Đã cập nhật menu của vai trò', detail: `Đã lưu cho ${roleCode}.` });
        },
      });
  }

  openCreate(parentCode: string | null = null): void {
    this.editing.set(null);
    this.form = { ...this.emptyForm(), parentCode };
    this.dialogVisible.set(true);
  }

  openEdit(menu: MenuRecord): void {
    this.editing.set(menu);
    this.form = {
      menuCode: menu.menuCode,
      label: menu.label,
      icon: menu.icon,
      iconColor: menu.iconColor,
      path: menu.path,
      parentCode: menu.parentCode,
      sortOrder: menu.sortOrder,
    };
    this.dialogVisible.set(true);
  }

  saveMenu(valid: boolean): void {
    if (!valid || this.saving()) return;
    const current = this.editing();
    const payload: MenuPayload = {
      menuCode: this.form.menuCode.trim(),
      label: this.form.label.trim(),
      icon: this.form.icon.trim(),
      iconColor: this.form.iconColor?.trim() || null,
      path: this.form.path?.trim() || null,
      parentCode: this.form.parentCode?.trim() || null,
      sortOrder: Number(this.form.sortOrder),
    };
    this.saving.set(true);
    const operation = current ? this.api.update(current.id, payload) : this.api.create(payload);
    operation.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => {
        this.dialogVisible.set(false);
        this.loadMenus();
        this.menuService.loadCurrentMenu();
        this.toast.show({ severity: 'success', summary: current ? 'Đã cập nhật menu' : 'Đã thêm menu', detail: payload.label });
      },
    });
  }

  async deleteMenu(menu: MenuRecord): Promise<void> {
    const confirmed = await this.confirm.confirm('Xóa menu', `Xóa menu “${menu.label}”?`, {
      type: 'danger', okText: 'Xóa',
    });
    if (!confirmed) return;
    this.api.remove(menu.id).subscribe({
      next: () => {
        this.loadMenus();
        this.menuService.loadCurrentMenu();
        this.selectedCodes.update(codes => {
          const next = new Set(codes);
          next.delete(menu.menuCode);
          return next;
        });
        this.toast.show({ severity: 'success', summary: 'Đã xóa menu', detail: menu.label });
      },
    });
  }

  private loadRoles(page: number, collected: RoleResponse[]): void {
    this.loadingRoles.set(true);
    this.roleService.searchRoles({ page, size: 100, isDeleted: false }).subscribe({
      next: response => {
        const all = [...collected, ...(response.data?.content ?? [])];
        if (page + 1 < (response.data?.totalPages ?? 0)) {
          this.loadRoles(page + 1, all);
          return;
        }
        this.roles.set(all);
        this.loadingRoles.set(false);
        if (all.length && !this.selectedRole()) this.selectRole(all[0].roleCode);
      },
      error: () => this.loadingRoles.set(false),
    });
  }

  private emptyForm(): MenuPayload {
    return { menuCode: '', label: '', icon: 'menu', iconColor: null, path: null, parentCode: null, sortOrder: 10 };
  }
}
