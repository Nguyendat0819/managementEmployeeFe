import { Injectable, signal } from '@angular/core';
import { ADMIN_PERMISSIONS, ADMIN_ROLE_PERMISSIONS, ADMIN_ROLES } from '../data/admin-role.mock';

@Injectable({ providedIn: 'root' })
export class AdminRoleService {
  readonly roles = signal(ADMIN_ROLES.map((role) => ({ ...role })));
  readonly permissions = signal(ADMIN_PERMISSIONS.map((permission) => ({ ...permission })));
  readonly rolePermissions = signal<Record<string, string[]>>(Object.fromEntries(
    Object.entries(ADMIN_ROLE_PERMISSIONS).map(([roleCode, permissionCodes]) => [roleCode, [...permissionCodes]]),
  ));
}
