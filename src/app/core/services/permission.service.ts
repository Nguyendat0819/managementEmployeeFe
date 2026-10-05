import { inject, Injectable } from '@angular/core';
import { AuthService } from '@platform/shared';
import { MenuItem } from '../menu/menu-item.model';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly auth = inject(AuthService);

  hasRole(role: string): boolean {
    const roles = this.auth.claims['roles'];

    if (Array.isArray(roles)) {
      return roles.includes(role);
    }

    return roles === role;
  }

  hasPermission(permission: string): boolean {
    const permissions = this.auth.claims['permissions'];

    return Array.isArray(permissions) && permissions.includes(permission);
  }

  canAccess(item: MenuItem): boolean {
    const hasRoleRule = !!item.roles?.length;
    const hasPermissionRule = !!item.permissions?.length;

    if (!hasRoleRule && !hasPermissionRule) return true;

    return (
      (hasRoleRule && item.roles!.some((role) => this.hasRole(role))) ||
      (hasPermissionRule && item.permissions!.some((permission) => this.hasPermission(permission)))
    );
  }
}
