import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@platform/shared';
import {
  SsButtonComponent,
  SsCardComponent,
  SsCardFooterStartDirective,
  SsStatComponent,
  SsTagComponent,
} from '@platform/ui-kit';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { DashboardService } from '../service/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NzIconModule, SsButtonComponent, SsCardComponent, SsCardFooterStartDirective, SsStatComponent, SsTagComponent],
  templateUrl: './dashboard_employee.component.html',
  styleUrl: './dashboard_employee.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardEmployeeComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dashboardService = inject(DashboardService);

  readonly today = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date());

  readonly quickActions = this.dashboardService.quickActions;
  readonly announcements = this.dashboardService.announcements;

  get displayName(): string {
    const claims = this.auth.claims;
    for (const key of ['user', 'userName', 'username', 'name', 'preferred_username']) {
      const value = claims[key];
      if (typeof value === 'string' && value.trim()) return value;
    }
    return 'Bạn';
  }

  open(path: string): void {
    void this.router.navigateByUrl(path);
  }
}
