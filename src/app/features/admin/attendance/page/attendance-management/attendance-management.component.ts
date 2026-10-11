import { Component } from '@angular/core';
import { AdminAttendanceManagementComponent } from '../../components/attendance-management/admin-attendance-management.component';

@Component({
  selector: 'app-attendance-management-page',
  standalone: true,
  imports: [AdminAttendanceManagementComponent],
  templateUrl: './attendance-management.component.html',
  styleUrl: './attendance-management.component.css',
})
export class AttendanceManagementComponent {}
