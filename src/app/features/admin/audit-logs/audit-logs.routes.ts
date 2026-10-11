import { Routes } from '@angular/router';
import { AuditLogComponent } from './page/audit-log/audit-log.component';

export const auditLogAdminRoutes: Routes = [
  {
    path: '',
    title: 'Audit Log',
    component: AuditLogComponent,
  },
];
