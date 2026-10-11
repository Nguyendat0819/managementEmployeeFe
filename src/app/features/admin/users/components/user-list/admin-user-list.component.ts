import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SsButtonComponent, SsConfirmService, SsDataTableComponent, SsDialogComponent, SsDtActionClick, SsDtButton, SsDtColumn, SsDtConfig, SsToastService } from '@platform/ui-kit';
import { AdminUser, AdminUserStatus } from '../../models/admin-user.model';
import { AdminUserService } from '../../services/admin-user.service';

interface UserForm {
  userName: string;
  fullName: string;
  email: string;
  password: string;
  passwordConfirm: string;
  roleCode: string;
  status: AdminUserStatus;
}

@Component({
  selector: 'app-admin-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SsButtonComponent, SsDataTableComponent, SsDialogComponent],
  templateUrl: './admin-user-list.component.html',
  styleUrl: './admin-user-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUserListComponent {
  private readonly userService = inject(AdminUserService);
  private readonly confirmService = inject(SsConfirmService);
  private readonly toast = inject(SsToastService);

  readonly users = signal(this.userService.users);
  readonly createVisible = signal(false);
  readonly userForm: UserForm = this.emptyUserForm();
  readonly roleOptions = [
    { label: 'Quản trị viên', value: 'ADMIN' },
    { label: 'Nhân sự', value: 'HR' },
    { label: 'Quản lý', value: 'MANAGER' },
    { label: 'Nhân viên', value: 'EMPLOYEE' },
  ];
  readonly userColumns: SsDtColumn<AdminUser>[] = [
    { key: 'userName', header: 'Tên đăng nhập', field: 'userName', width: '175px', sortable: true, filterable: true },
    { key: 'fullName', header: 'Họ và tên', field: 'fullName', width: '190px', sortable: true, filterable: true },
    { key: 'email', header: 'Email', field: 'email', width: '235px', filterable: true },
    { key: 'roleCode', header: 'Vai trò', field: 'roleCode', type: 'status', width: '145px', filterable: true, options: [{ label: 'Quản trị viên', value: 'ADMIN', color: '#722ed1' }, { label: 'Nhân sự', value: 'HR', color: '#1677ff' }, { label: 'Quản lý', value: 'MANAGER', color: '#13c2c2' }, { label: 'Nhân viên', value: 'EMPLOYEE', color: '#8c8c8c' }] },
    { key: 'lastLoginAt', header: 'Đăng nhập gần nhất', field: 'lastLoginAt', width: '165px', sortable: true },
    { key: 'createdAt', header: 'Ngày tạo', field: 'createdAt', width: '120px', sortable: true },
    { key: 'status', header: 'Trạng thái', field: 'status', type: 'status', width: '125px', options: [{ label: 'Hoạt động', value: 'Hoạt động', color: '#32b36b' }, { label: 'Tạm khóa', value: 'Tạm khóa', color: '#ff6b6b' }] },
  ];

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
    pageSizeOptions: [10, 20, 50],
    rowActions: [
      { key: 'reset-password', label: 'Đặt lại mật khẩu', icon: 'key' },
      { key: 'lock', label: 'Khóa tài khoản', icon: 'lock', danger: true, visible: (row) => row.status === 'Hoạt động' },
      { key: 'unlock', label: 'Mở khóa tài khoản', icon: 'unlock', visible: (row) => row.status === 'Tạm khóa' },
      { key: 'delete', label: 'Xóa tài khoản', icon: 'delete', danger: true, visible: (row) => row.userName !== 'admin' },
    ],
    quickFilters: [
      { key: 'roleCode', placeholder: 'Tất cả vai trò', options: this.roleOptions },
      { key: 'status', placeholder: 'Tất cả trạng thái', options: [{ label: 'Hoạt động', value: 'Hoạt động' }, { label: 'Tạm khóa', value: 'Tạm khóa' }] },
    ],
    striped: true,
    size: 'small',
    scrollX: '1080px',
    emptyText: 'Không có tài khoản phù hợp',
  };

  onPrimaryClick(button: SsDtButton): void {
    if (button.key !== 'create-user') return;
    Object.assign(this.userForm, this.emptyUserForm());
    this.createVisible.set(true);
  }

  closeCreateDialog(): void {
    this.createVisible.set(false);
  }

  saveUser(formValid: boolean): void {
    if (!formValid) return;
    const userName = this.userForm.userName.trim();
    const email = this.userForm.email.trim().toLowerCase();
    if (this.users().some((user) => user.userName.toLowerCase() === userName.toLowerCase())) {
      this.toast.show({ severity: 'warning', summary: 'Tên đăng nhập đã tồn tại', detail: 'Vui lòng sử dụng một tên đăng nhập khác.' });
      return;
    }
    if (this.users().some((user) => user.email.toLowerCase() === email)) {
      this.toast.show({ severity: 'warning', summary: 'Email đã tồn tại', detail: 'Vui lòng sử dụng một địa chỉ email khác.' });
      return;
    }
    if (this.userForm.password !== this.userForm.passwordConfirm) {
      this.toast.show({ severity: 'warning', summary: 'Mật khẩu xác nhận không khớp', detail: 'Vui lòng nhập lại mật khẩu xác nhận.' });
      return;
    }

    const newUser: AdminUser = {
      id: Date.now(),
      userName,
      fullName: this.userForm.fullName.trim(),
      email,
      roleCode: this.userForm.roleCode,
      lastLoginAt: 'Chưa đăng nhập',
      createdAt: '07/10/2025',
      status: this.userForm.status,
    };
    this.users.update((users) => [newUser, ...users]);
    this.refreshTableStatus();
    this.closeCreateDialog();
    this.toast.show({ severity: 'success', summary: 'Đã thêm tài khoản', detail: `Tài khoản ${userName} đã được tạo thành công.` });
  }

  onActionClick(event: SsDtActionClick<AdminUser>): void {
    if (event.action.key === 'reset-password') {
      this.toast.show({ severity: 'info', summary: 'Đã gửi yêu cầu đặt lại mật khẩu', detail: `Liên kết đặt lại mật khẩu đã được gửi tới ${event.row.email}.` });
      return;
    }
    if (event.action.key === 'lock' || event.action.key === 'unlock') {
      this.toggleStatus(event.row, event.action.key === 'lock' ? 'Tạm khóa' : 'Hoạt động');
      return;
    }
    if (event.action.key === 'delete') void this.deleteUser(event.row);
  }

  private toggleStatus(user: AdminUser, status: AdminUserStatus): void {
    this.users.update((users) => users.map((item) => item.id === user.id ? { ...item, status } : item));
    this.toast.show({ severity: status === 'Hoạt động' ? 'success' : 'warning', summary: status === 'Hoạt động' ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản', detail: `Tài khoản ${user.userName} hiện ở trạng thái ${status.toLowerCase()}.` });
  }

  private async deleteUser(user: AdminUser): Promise<void> {
    const confirmed = await this.confirmService.confirm('Xác nhận xóa tài khoản', `Bạn có chắc muốn xóa tài khoản "${user.userName}" không?`, { type: 'danger', okText: 'Xóa' });
    if (!confirmed) return;
    this.users.update((users) => users.filter((item) => item.id !== user.id));
    this.refreshTableStatus();
    this.toast.show({ severity: 'success', summary: 'Đã xóa tài khoản', detail: `Tài khoản ${user.userName} đã được xóa.` });
  }

  private refreshTableStatus(): void {
    this.userTableSettings = { ...this.userTableSettings, cardStatusLabel: `${this.users().length} tài khoản` };
  }

  private emptyUserForm(): UserForm {
    return { userName: '', fullName: '', email: '', password: '', passwordConfirm: '', roleCode: 'EMPLOYEE', status: 'Hoạt động' };
  }
}
