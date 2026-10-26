import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { SsButtonComponent, SsDataTableComponent, SsDialogComponent, SsDtActionClick, SsDtButton, SsDtColumn, SsDtConfig, SsToastService } from '@platform/ui-kit';
import { AdminRoleService } from '../../../roles-permissions/services/admin-role.service';
import { AdminUser, AdminUserStatus } from '../../models/admin-user.model';
import { AdminUserService, CreateAdminUserRequest, PasswordResetRequest } from '../../services/admin-user.service';

interface UserForm {
  userName: string;
  fullName: string;
  email: string;
  password: string;
  passwordConfirm: string;
  roleCode: string;
  status: AdminUserStatus;
}

interface PasswordResetTarget {
  id: number;
  userName: string;
  fullName: string;
}

interface RoleOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-admin-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SsButtonComponent, SsDataTableComponent, SsDialogComponent],
  templateUrl: './admin-user-list.component.html',
  styleUrl: './admin-user-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUserListComponent implements OnInit {
  private readonly userService = inject(AdminUserService);
  private readonly roleService = inject(AdminRoleService);
  private readonly toast = inject(SsToastService);
  private readonly destroyRef = inject(DestroyRef);
  private knownPasswordResetRequests = new Map<number, string>();
  private hasLoadedPasswordResetRequests = false;

  readonly users = signal<AdminUser[]>([]);
  readonly createVisible = signal(false);
  readonly roleChangeVisible = signal(false);
  readonly resetPasswordVisible = signal(false);
  readonly selectedRoleUser = signal<AdminUser | null>(null);
  readonly selectedUser = signal<PasswordResetTarget | null>(null);
  readonly loadingUsers = signal(false);
  readonly loadingRoles = signal(false);
  readonly roleOptions = signal<RoleOption[]>([]);
  readonly passwordResetRequests = signal<PasswordResetRequest[]>([]);
  readonly loadingPasswordResetRequests = signal(false);
  readonly saving = signal(false);
  readonly userForm: UserForm = this.emptyUserForm();
  roleFormCode = '';
  readonly resetPasswordForm = { password: '', passwordConfirm: '' };
  userColumns: SsDtColumn<AdminUser>[] = this.buildUserColumns([]);

  userTableSettings: SsDtConfig<AdminUser> = {
    rowKey: 'id',
    title: 'Tài khoản người dùng',
    description: 'Theo dõi thông tin cơ bản và quản lý trạng thái truy cập',
    cardIcon: 'user',
    cardStatusLabel: `${this.users().length} tài khoản`,
    cardStatusType: 'info',
    primaryButtons: [{ key: 'create-user', label: 'Thêm tài khoản', type: 'primary', icon: 'plus' }],
    searchable: true,
    searchPlaceholder: 'Tìm theo tên đăng nhập, họ tên hoặc email',
    showSort: true,
    showFilter: true,
    showSetting: true,
    showPagination: true,
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    rowActions: [
      { key: 'change-role', label: 'Đổi vai trò', icon: 'user' },
      { key: 'reset-password', label: 'Đặt lại mật khẩu', icon: 'key' },
      { key: 'lock', label: 'Khóa tài khoản', icon: 'lock', danger: true, visible: (row) => row.status === 'Hoạt động' },
      { key: 'unlock', label: 'Mở khóa tài khoản', icon: 'unlock', visible: (row) => row.status === 'Tạm khóa' },
    ],
    quickFilters: [
      { key: 'roleCode', placeholder: 'Tất cả vai trò', options: [] },
      { key: 'status', placeholder: 'Tất cả trạng thái', options: [{ label: 'Hoạt động', value: 'Hoạt động' }, { label: 'Tạm khóa', value: 'Tạm khóa' }] },
    ],
    striped: true,
    size: 'small',
    scrollX: '1080px',
    emptyText: 'Không có tài khoản phù hợp',
  };

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoleOptions();
    this.loadPasswordResetRequests(true);
    timer(30_000, 30_000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadPasswordResetRequests());
  }

  onPrimaryClick(button: SsDtButton): void {
    if (button.key !== 'create-user') return;
    Object.assign(this.userForm, this.emptyUserForm());
    this.createVisible.set(true);
  }

  closeCreateDialog(): void {
    this.createVisible.set(false);
    Object.assign(this.userForm, this.emptyUserForm());
  }

  onCreateDialogVisibilityChange(visible: boolean): void {
    if (visible) this.createVisible.set(true);
    else this.closeCreateDialog();
  }

  saveUser(formValid: boolean): void {
    if (!formValid) return;
    const userName = this.userForm.userName.trim();
    const email = this.userForm.email.trim().toLowerCase();
    if (this.userForm.password !== this.userForm.passwordConfirm) {
      this.toast.show({ severity: 'warning', summary: 'Mật khẩu xác nhận không khớp', detail: 'Vui lòng nhập lại mật khẩu xác nhận.' });
      return;
    }

    const [firstName, ...lastNameParts] = this.userForm.fullName.trim().split(/\s+/);
    const request: CreateAdminUserRequest = {
      username: userName,
      email,
      firstName,
      lastName: lastNameParts.join(' '),
      password: this.userForm.password,
      roleCode: this.userForm.roleCode,
      status: this.userForm.status === 'Hoạt động' ? 'ACTIVE' : 'INACTIVE',
    };
    this.saving.set(true);
    this.userService.createUser(request).subscribe({
      next: (newUser) => {
        this.users.update((users) => [newUser, ...users]);
        this.refreshTableStatus();
        this.closeCreateDialog();
        this.toast.show({ severity: 'success', summary: 'Đã thêm tài khoản', detail: `Tài khoản ${userName} đã được tạo thành công.` });
        this.saving.set(false);
      },
      error: () => this.saving.set(false),
    });
  }

  onActionClick(event: SsDtActionClick<AdminUser>): void {
    if (event.action.key === 'change-role') {
      this.selectedRoleUser.set(event.row);
      this.roleFormCode = event.row.roleCode;
      this.roleChangeVisible.set(true);
      return;
    }
    if (event.action.key === 'reset-password') {
      this.selectedUser.set({ id: event.row.id, userName: event.row.userName, fullName: event.row.fullName });
      this.resetPasswordForm.password = '';
      this.resetPasswordForm.passwordConfirm = '';
      this.resetPasswordVisible.set(true);
      return;
    }
    if (event.action.key === 'lock' || event.action.key === 'unlock') {
      this.toggleStatus(event.row, event.action.key === 'lock' ? 'Tạm khóa' : 'Hoạt động');
      return;
    }
  }

  saveRoleChange(formValid: boolean): void {
    const user = this.selectedRoleUser();
    if (!user || !formValid || !this.roleFormCode || this.roleFormCode === user.roleCode) return;

    this.saving.set(true);
    this.userService.updateRole(user.userName, this.roleFormCode).subscribe({
      next: (updatedUser) => {
        this.users.update((users) => users.map((item) => item.id === user.id ? updatedUser : item));
        this.closeRoleChangeDialog();
        this.toast.show({ severity: 'success', summary: 'Đã cập nhật vai trò', detail: `Tài khoản ${user.userName} đã được đổi sang vai trò ${updatedUser.roleCode}.` });
        this.saving.set(false);
      },
      error: () => {
        this.toast.show({ severity: 'error', summary: 'Không thể cập nhật vai trò', detail: 'Kiểm tra vai trò đã tồn tại và còn hoạt động, sau đó thử lại.' });
        this.saving.set(false);
      },
    });
  }

  closeRoleChangeDialog(): void {
    this.roleChangeVisible.set(false);
    this.selectedRoleUser.set(null);
    this.roleFormCode = '';
  }

  onRoleChangeDialogVisibilityChange(visible: boolean): void {
    if (visible) this.roleChangeVisible.set(true);
    else this.closeRoleChangeDialog();
  }

  resetPasswordFromRequest(request: PasswordResetRequest): void {
    this.selectedUser.set({ id: request.userId, userName: request.userName, fullName: request.fullName });
    this.resetPasswordForm.password = '';
    this.resetPasswordForm.passwordConfirm = '';
    this.resetPasswordVisible.set(true);
  }

  private toggleStatus(user: AdminUser, status: AdminUserStatus): void {
    const action = status === 'Hoạt động' ? 'RESTORE' : 'REVOKE';
    this.userService.updateStatus(user.userName, action).subscribe({
      next: (updatedUser) => {
        this.users.update((users) => users.map((item) => item.id === user.id ? updatedUser : item));
        this.toast.show({ severity: status === 'Hoạt động' ? 'success' : 'warning', summary: status === 'Hoạt động' ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản', detail: `Tài khoản ${user.userName} hiện ở trạng thái ${status.toLowerCase()}.` });
      },
    });
  }

  saveResetPassword(formValid: boolean): void {
    const user = this.selectedUser();
    if (!user || !formValid) return;
    if (this.resetPasswordForm.password !== this.resetPasswordForm.passwordConfirm) {
      this.toast.show({ severity: 'warning', summary: 'Mật khẩu xác nhận không khớp', detail: 'Vui lòng nhập lại mật khẩu xác nhận.' });
      return;
    }

    this.saving.set(true);
    this.userService.resetPassword(user.userName, this.resetPasswordForm.password).subscribe({
      next: () => {
        this.passwordResetRequests.update((requests) => requests.filter((request) => request.userId !== user.id));
        this.resetPasswordVisible.set(false);
        this.selectedUser.set(null);
        this.resetPasswordForm.password = '';
        this.resetPasswordForm.passwordConfirm = '';
        this.toast.show({ severity: 'success', summary: 'Đã đổi mật khẩu', detail: `Mật khẩu của tài khoản ${user.userName} đã được cập nhật.` });
        this.saving.set(false);
      },
      error: () => this.saving.set(false),
    });
  }

  closeResetPasswordDialog(): void {
    this.resetPasswordVisible.set(false);
    this.selectedUser.set(null);
    this.resetPasswordForm.password = '';
    this.resetPasswordForm.passwordConfirm = '';
  }

  onResetPasswordVisibilityChange(visible: boolean): void {
    if (visible) this.resetPasswordVisible.set(true);
    else this.closeResetPasswordDialog();
  }

  private loadUsers(): void {
    this.loadingUsers.set(true);
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.refreshTableStatus();
        this.loadingUsers.set(false);
      },
      error: () => this.loadingUsers.set(false),
    });
  }

  private loadRoleOptions(): void {
    this.loadingRoles.set(true);
    this.roleService.searchRoles({ page: 0, size: 200, isDeleted: false })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ data }) => {
          const options = (data?.content ?? [])
            .filter((role) => !role.isDeleted)
            .map((role) => ({ label: role.roleName || role.roleCode, value: role.roleCode }));
          this.roleOptions.set(options);
          this.userColumns = this.buildUserColumns(options);
          this.userTableSettings = {
            ...this.userTableSettings,
            quickFilters: [
              { key: 'roleCode', placeholder: 'Tất cả vai trò', options },
              { key: 'status', placeholder: 'Tất cả trạng thái', options: [{ label: 'Hoạt động', value: 'Hoạt động' }, { label: 'Tạm khóa', value: 'Tạm khóa' }] },
            ],
          };
          if (!options.some((role) => role.value === this.userForm.roleCode)) {
            this.userForm.roleCode = this.defaultRoleCode();
          }
          this.loadingRoles.set(false);
        },
        error: () => {
          this.loadingRoles.set(false);
          this.toast.show({ severity: 'error', summary: 'Không tải được vai trò', detail: 'Không thể lấy danh sách vai trò từ hệ thống.' });
        },
      });
  }

  private loadPasswordResetRequests(showError = false): void {
    this.loadingPasswordResetRequests.set(true);
    this.userService.getPasswordResetRequests().subscribe({
      next: (requests) => {
        const hasNewRequest = this.hasLoadedPasswordResetRequests
          && requests.some((request) => this.knownPasswordResetRequests.get(request.id) !== request.requestedAt);
        this.knownPasswordResetRequests = new Map(requests.map((request) => [request.id, request.requestedAt]));
        this.passwordResetRequests.set(requests);
        this.loadingPasswordResetRequests.set(false);
        if (hasNewRequest) {
          this.toast.show({ severity: 'warning', summary: 'Có yêu cầu đặt lại mật khẩu mới', detail: 'Quản trị viên cần xử lý yêu cầu trong danh sách tài khoản.' });
        }
        this.hasLoadedPasswordResetRequests = true;
      },
      error: () => {
        this.loadingPasswordResetRequests.set(false);
        if (showError) {
          this.toast.show({ severity: 'error', summary: 'Không tải được yêu cầu', detail: 'Không thể tải danh sách yêu cầu đặt lại mật khẩu.' });
        }
      },
    });
  }

  private refreshTableStatus(): void {
    this.userTableSettings = { ...this.userTableSettings, cardStatusLabel: `${this.users().length} tài khoản` };
  }

  hasRoleOption(roleCode: string): boolean {
    return this.roleOptions().some((role) => role.value === roleCode);
  }

  private buildUserColumns(options: RoleOption[]): SsDtColumn<AdminUser>[] {
    const colors = ['#722ed1', '#1677ff', '#13c2c2', '#8c8c8c', '#eb2f96', '#fa8c16'];
    const roleOptions = options.map((role, index) => ({
      ...role,
      color: colors[index % colors.length],
    }));
    return [
      { key: 'userName', header: 'Tên đăng nhập', field: 'userName', width: '175px', sortable: true, filterable: true },
      { key: 'fullName', header: 'Họ và tên', field: 'fullName', width: '190px', sortable: true, filterable: true },
      { key: 'email', header: 'Email', field: 'email', width: '235px', filterable: true },
      { key: 'roleCode', header: 'Vai trò', field: 'roleCode', type: 'status', width: '145px', filterable: true, options: roleOptions },
      { key: 'lastLoginAt', header: 'Đăng nhập gần nhất', field: 'lastLoginAt', width: '165px', sortable: true },
      { key: 'createdAt', header: 'Ngày tạo', field: 'createdAt', width: '120px', sortable: true },
      { key: 'status', header: 'Trạng thái', field: 'status', type: 'status', width: '125px', options: [{ label: 'Hoạt động', value: 'Hoạt động', color: '#32b36b' }, { label: 'Tạm khóa', value: 'Tạm khóa', color: '#ff6b6b' }] },
    ];
  }

  private emptyUserForm(): UserForm {
    return { userName: '', fullName: '', email: '', password: '', passwordConfirm: '', roleCode: this.defaultRoleCode(), status: 'Hoạt động' };
  }

  private defaultRoleCode(): string {
    const options = this.roleOptions();
    return options.find((role) => role.value === 'EMPLOYEE')?.value ?? options[0]?.value ?? '';
  }
}
