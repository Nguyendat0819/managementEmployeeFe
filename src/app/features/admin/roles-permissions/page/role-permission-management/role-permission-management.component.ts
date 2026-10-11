import { Component } from '@angular/core';
import {AdminRolePermissionManagementComponent} from '@features/admin/roles-permissions/components/role-permission-management/admin-role-permission-management.component'
@Component({
  selector: 'app-role-permission-management-page',
  standalone: true,
  imports: [AdminRolePermissionManagementComponent],
  templateUrl: './role-permission-management.component.html',
  styleUrl: './role-permission-management.component.css',
})
export class RolePermissionManagementComponent {}
