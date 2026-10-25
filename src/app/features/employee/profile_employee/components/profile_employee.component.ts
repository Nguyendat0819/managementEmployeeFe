import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '@platform/shared';
import { SsButtonComponent, SsCardComponent, SsCardFooterStartDirective, SsDialogComponent, SsTagComponent, SsToastService } from '@platform/ui-kit';
import { ProfileEmployeeService } from '../service/profile_employee.service';
import { AuthFeatureService } from '../../../auth/service/auth.service';

@Component({
  selector: 'app-profile-employee',
  standalone: true,
  imports: [CommonModule, FormsModule, SsButtonComponent, SsCardComponent, SsCardFooterStartDirective, SsDialogComponent, SsTagComponent],
  templateUrl: './profile_employee.component.html',
  styleUrl: './profile_employee.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileEmployeeComponent implements OnInit {
  private readonly profileService = inject(ProfileEmployeeService);
  private readonly toast = inject(SsToastService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly auth = inject(AuthService);
  private readonly authFeature = inject(AuthFeatureService);
  private readonly router = inject(Router);

  readonly profile = this.profileService.profile;
  readonly contract = this.profileService.contract;
  readonly dialogVisible = signal(false);
  readonly passwordDialogVisible = signal(false);
  readonly passwordSubmitting = signal(false);
  readonly showCurrentPassword = signal(false);
  readonly showNewPassword = signal(false);
  readonly showConfirmPassword = signal(false);
  readonly profileForm = { phone: '', email: '', address: '' };
  readonly passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };

  ngOnInit(): void {
    this.profileService.getCurrentProfile().subscribe({
      next: (response) => {
        this.profileService.applyResponse(response.data);
        this.changeDetectorRef.markForCheck();
      },
      error: () => {
        this.profileService.markProfileUnavailable();
        this.changeDetectorRef.markForCheck();
        this.toast.show({ severity: 'warning', summary: 'Không tải được hồ sơ', detail: 'Vui lòng kiểm tra tài khoản hoặc thử tải lại trang.' });
      },
    });
    this.profileService.getCurrentContract().subscribe({
      next: (response) => {
        this.profileService.applyContractResponse(response.data);
        this.changeDetectorRef.markForCheck();
      },
      error: () => {
        this.profileService.applyContractResponse(null);
        this.changeDetectorRef.markForCheck();
        this.toast.show({ severity: 'warning', summary: 'Không tải được hợp đồng', detail: 'Vui lòng thử tải lại trang.' });
      },
    });
  }

  openUpdateDialog(): void {
    this.profileForm.phone = this.profile.phone;
    this.profileForm.email = this.profile.email;
    this.profileForm.address = this.profile.address;
    this.dialogVisible.set(true);
  }

  closeUpdateDialog(): void {
    this.dialogVisible.set(false);
  }

  saveProfile(): void {
    if (!this.profileForm.phone.trim() || !this.profileForm.email.trim() || !this.profileForm.address.trim()) {
      this.toast.show({ severity: 'warning', summary: 'Chưa đủ thông tin', detail: 'Vui lòng điền đầy đủ số điện thoại, email và địa chỉ.' });
      return;
    }
    this.profile.phone = this.profileForm.phone.trim();
    this.profile.email = this.profileForm.email.trim();
    this.profile.address = this.profileForm.address.trim();
    this.closeUpdateDialog();
    this.toast.show({ severity: 'success', summary: 'Đã lưu đề nghị cập nhật', detail: 'Thông tin cập nhật của bạn đã được ghi nhận.' });
  }

  openPasswordDialog(): void {
    this.passwordForm.currentPassword = '';
    this.passwordForm.newPassword = '';
    this.passwordForm.confirmPassword = '';
    this.resetPasswordVisibility();
    this.passwordDialogVisible.set(true);
  }

  closePasswordDialog(): void {
    this.passwordDialogVisible.set(false);
    this.passwordForm.currentPassword = '';
    this.passwordForm.newPassword = '';
    this.passwordForm.confirmPassword = '';
    this.resetPasswordVisibility();
  }

  private resetPasswordVisibility(): void {
    this.showCurrentPassword.set(false);
    this.showNewPassword.set(false);
    this.showConfirmPassword.set(false);
  }

  onPasswordDialogVisibilityChange(visible: boolean): void {
    if (visible) this.passwordDialogVisible.set(true);
    else this.closePasswordDialog();
  }

  async changePassword(formValid: boolean): Promise<void> {
    if (!formValid) return;
    if (this.passwordForm.newPassword.length < 8) {
      this.toast.show({ severity: 'warning', summary: 'Mật khẩu chưa đủ dài', detail: 'Mật khẩu mới cần có ít nhất 8 ký tự.' });
      return;
    }
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.toast.show({ severity: 'warning', summary: 'Mật khẩu xác nhận không khớp', detail: 'Vui lòng nhập lại mật khẩu xác nhận.' });
      return;
    }

    this.passwordSubmitting.set(true);
    try {
      await this.authFeature.changePassword({
        currentPassword: this.passwordForm.currentPassword,
        newPassword: this.passwordForm.newPassword,
      });
      this.closePasswordDialog();
      this.toast.show({ severity: 'success', summary: 'Đã đổi mật khẩu', detail: 'Vui lòng đăng nhập lại bằng mật khẩu mới.' });
      this.auth.logout();
      await this.router.navigateByUrl('/login');
    } catch (error) {
      const status = (error as HttpErrorResponse)?.status;
      this.toast.show({
        severity: 'error',
        summary: status === 401 ? 'Mật khẩu hiện tại không đúng' : 'Không thể đổi mật khẩu',
        detail: status === 401 ? 'Kiểm tra lại mật khẩu hiện tại và thử lại.' : 'Vui lòng thử lại sau.',
      });
    } finally {
      this.passwordSubmitting.set(false);
    }
  }
}
