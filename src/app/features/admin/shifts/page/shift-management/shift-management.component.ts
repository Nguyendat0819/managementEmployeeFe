import { Component } from '@angular/core';
import { AdminShiftListComponent } from '../../components/shift-list/admin-shift-list.component';

@Component({
  selector: 'app-shift-management',
  standalone: true,
  imports: [AdminShiftListComponent],
  templateUrl: './shift-management.component.html',
  styleUrl: './shift-management.component.css',
})
export class ShiftManagementComponent {}
