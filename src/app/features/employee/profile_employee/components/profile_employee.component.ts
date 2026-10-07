import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SsButtonComponent, SsCardComponent, SsCardFooterStartDirective, SsDialogComponent, SsTagComponent, SsToastService } from '@platform/ui-kit';
import { ProfileEmployeeService } from '../service/profile_employee.service';

@Component({
  selector: 'app-profile-employee',
  standalone: true,
  imports: [CommonModule, FormsModule, SsButtonComponent, SsCardComponent, SsCardFooterStartDirective, SsDialogComponent, SsTagComponent],
  templateUrl: './profile_employee.component.html',
  styleUrl: './profile_employee.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileEmployeeComponent {
  private readonly profileService = inject(ProfileEmployeeService);
  private readonly toast = inject(SsToastService);

  readonly profile = this.profileService.profile;
  readonly contract = this.profileService.contract;
  readonly dialogVisible = signal(false);
  readonly profileForm = { phone: '', email: '', address: '' };

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
}
