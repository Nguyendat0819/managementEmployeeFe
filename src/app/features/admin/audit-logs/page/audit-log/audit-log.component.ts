import { Component } from '@angular/core';
import { AdminAuditLogComponent } from '../../components/audit-log/admin-audit-log.component';

@Component({
  selector: 'app-audit-log-management-page',
  standalone: true,
  imports: [AdminAuditLogComponent],
  templateUrl: './audit-log.component.html',
  styleUrl: './audit-log.component.css',
})
export class AuditLogComponent {}
