import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '@platform/shared';

/**
 * Guard bảo vệ các route yêu cầu xác thực người dùng.
 * - Kiểm tra trạng thái đăng nhập từ `AuthService` (@platform/shared).
 * - Nếu người dùng chưa đăng nhập: tự động kích hoạt luồng OIDC PKCE
 *   và chuyển hướng thẳng tới đường đăng nhập Keycloak (không qua trang login trung gian).
 */
export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);

  if (authService.isAuthenticated()) {
    return true;
  }

  if (typeof window !== 'undefined') {
    try {
      await authService.init();
      return authService.isAuthenticated();
    } catch (e) {
      console.error('[authGuard] Keycloak login redirect failed:', e);
      return false;
    }
  }

  return false;
};
