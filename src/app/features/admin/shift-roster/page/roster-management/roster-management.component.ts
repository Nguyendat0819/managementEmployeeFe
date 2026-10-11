import { Component } from '@angular/core';
import { AdminShiftAssignmentListComponent } from '../../components/assignment-list/admin-shift-assignment-list.component';

@Component({
  selector: 'app-roster-management',
  standalone: true,
  imports: [AdminShiftAssignmentListComponent],
  templateUrl: './roster-management.component.html',
  styleUrl: './roster-management.component.css',
})
export class RosterManagementComponent {}
