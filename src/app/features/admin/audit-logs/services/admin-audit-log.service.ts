import { Injectable } from '@angular/core';
import { ADMIN_AUDIT_LOGS } from '../data/admin-audit-log.mock';

@Injectable({ providedIn: 'root' })
export class AdminAuditLogService {
  readonly logs = ADMIN_AUDIT_LOGS.map((log) => ({ ...log }));
}
