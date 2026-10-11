import { Component } from '@angular/core';
import { AdminUserListComponent } from '../../components/user-list/admin-user-list.component';

@Component({
  selector: 'app-user-management-page',
  standalone: true,
  imports: [AdminUserListComponent],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css',
})
export class UserManagementComponent {}
