import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoint';
import { ApiResponse, Page } from '@core/models/api-response.interface';
import { BaseService } from '@core/services/base.service';
import { AdminAuditLog, AdminAuditLogSummary } from '../models/admin-audit-log.model';

@Injectable({ providedIn: 'root' })
export class AdminAuditLogService extends BaseService {
  searchLogs(params: Record<string, string | number | readonly (string | number)[]>): Observable<ApiResponse<Page<AdminAuditLog>>> {
    return this.get<ApiResponse<Page<AdminAuditLog>>>(
      '',
      API_ENDPOINTS.AuditLog.BASE,
      { params },
    );
  }

  getSummary(): Observable<ApiResponse<AdminAuditLogSummary>> {
    return this.get<ApiResponse<AdminAuditLogSummary>>(
      API_ENDPOINTS.AuditLog.SUMMARY,
      API_ENDPOINTS.AuditLog.BASE,
    );
  }
}
