import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@platform/shared';
import { SsButtonComponent, SsInputComponent } from '@platform/ui-kit';
import { environment } from '@env/environment';

type AuthMode = 'login' | 'register';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SsInputComponent, SsButtonComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly mode = signal<AuthMode>('login');
  readonly submitting = signal(false);
  readonly error = signal('');
  readonly success = signal('');
  readonly form = this.formBuilder.nonNullable.group({
    username: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    firstName: ['', Validators.maxLength(100)],
    lastName: ['', Validators.maxLength(100)],
    password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
    confirmPassword: [''],
  });

  setMode(mode: AuthMode): void {
    this.mode.set(mode);
    this.error.set('');
    this.success.set('');
    this.form.reset();
  }

  async submit(): Promise<void> {
    this.error.set('');
    this.success.set('');
    this.form.markAllAsTouched();
    const loginInvalid = this.form.controls.username.invalid || this.form.controls.password.invalid;
    if ((this.mode() === 'login' && loginInvalid) || (this.mode() === 'register' && (this.form.invalid || !this.passwordsMatch()))) return;

    this.submitting.set(true);
    try {
      if (this.mode() === 'login') {
        await this.auth.login({
          username: this.form.controls.username.value,
          password: this.form.controls.password.value,
        });
        await this.router.navigateByUrl('/dashboard');
      } else {
        this.register();
        this.setMode('login');
        this.success.set('Tài khoản đã được tạo. Bạn có thể đăng nhập ngay bây giờ.');
      }
    } catch (error) {
      this.error.set(this.mode() === 'login' ? 'Tên đăng nhập hoặc mật khẩu không đúng.' : this.registrationError(error));
    } finally {
      this.submitting.set(false);
    }
  }

  passwordsMatch(): boolean {
    return this.form.controls.password.value === this.form.controls.confirmPassword.value;
  }

  private register(): Promise<unknown> {
    const { username, email, firstName, lastName, password } = this.form.getRawValue();
    const url = `${environment.apiBaseUrl}/${environment.contextPath}/api/auth/register`;
    return new Promise((resolve, reject) =>
      this.http.post(url, { username, email, firstName, lastName, password, roleCode: 'USER' }).subscribe({
        next: resolve,
        error: reject,
      }),
    );
  }

  private registrationError(error: unknown): string {
    const response = error as HttpErrorResponse;
    if (response?.status === 409) return 'Tên đăng nhập hoặc email đã được sử dụng.';
    if (response?.status === 0) return 'Không thể kết nối tới máy chủ. Vui lòng thử lại.';
    return 'Không thể tạo tài khoản. Vui lòng kiểm tra thông tin và thử lại.';
  }
}
