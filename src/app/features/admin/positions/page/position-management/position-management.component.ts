import { Component } from '@angular/core';
import { AdminPositionListComponent } from '../../components/position-list/admin-position-list.component';

@Component({
  selector: 'app-position-management',
  standalone: true,
  imports: [AdminPositionListComponent],
  templateUrl: './position-management.component.html',
  styleUrl: './position-management.component.css',
})
export class PositionManagementComponent {}
