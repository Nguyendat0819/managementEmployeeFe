import { Component } from '@angular/core';
import { AdminLeavePolicyComponent } from '../../components/leave-policy/admin-leave-policy.component';

@Component({
  selector: 'app-leave-settings-page',
  standalone: true,
  imports: [AdminLeavePolicyComponent],
  templateUrl: './leave-settings.component.html',
  styleUrl: './leave-settings.component.css',
})
export class LeaveSettingsComponent {}
