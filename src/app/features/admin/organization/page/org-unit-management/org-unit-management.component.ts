import { Component } from '@angular/core';
import { OrgUnitListComponent } from '../../components/org-unit-list/org-unit-list.component';

@Component({
  selector: 'app-org-unit-management',
  standalone: true,
  imports: [OrgUnitListComponent],
  templateUrl: './org-unit-management.component.html',
  styleUrl: './org-unit-management.component.css',
})
export class OrgUnitManagementComponent {}
