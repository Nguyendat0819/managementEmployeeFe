import { Component } from '@angular/core';
import { AdminLeaveApprovalComponent } from '../../components/leave-approval/admin-leave-approval.component';

@Component({
  selector: 'app-leave-approval-page',
  standalone: true,
  imports: [AdminLeaveApprovalComponent],
  templateUrl: './leave-approval.component.html',
  styleUrl: './leave-approval.component.css',
})
export class LeaveApprovalComponent {}
