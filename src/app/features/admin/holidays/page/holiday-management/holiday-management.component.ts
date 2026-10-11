import { Component } from '@angular/core';
import { AdminHolidayListComponent } from '../../components/holiday-list/admin-holiday-list.component';

@Component({
  selector: 'app-holiday-management',
  standalone: true,
  imports: [AdminHolidayListComponent],
  templateUrl: './holiday-management.component.html',
  styleUrl: './holiday-management.component.css',
})
export class HolidayManagementComponent {}
