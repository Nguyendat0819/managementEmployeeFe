import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { SsTabComponent, SsTabsComponent } from '@platform/ui-kit';
import { AdminPermissionListComponent } from '../permission-list/admin-permission-list.component';
import { AdminRoleListComponent } from '../role-list/admin-role-list.component';
import { AdminRoleService } from '../../services/admin-role.service';

@Component({
  selector: 'app-admin-role-permission-management',
  standalone: true,
  imports: [SsTabComponent, SsTabsComponent, AdminRoleListComponent, AdminPermissionListComponent],
  templateUrl: './admin-role-permission-management.component.html',
  styleUrl: './admin-role-permission-management.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminRolePermissionManagementComponent {
  private readonly roleService = inject(AdminRoleService);

  readonly roles = this.roleService.roles;
  readonly selectedRoleCode = signal('ADMIN');
  selectedTabIndex = 0;

  onTabChange(index: number): void {
    this.selectedTabIndex = index;
  }

  onPermissionsRequested(roleCode: string): void {
    this.selectedRoleCode.set(roleCode);
    this.selectedTabIndex = 1;
  }

  onRoleCodeChange(roleCode: string): void {
    this.selectedRoleCode.set(roleCode);
  }
}
