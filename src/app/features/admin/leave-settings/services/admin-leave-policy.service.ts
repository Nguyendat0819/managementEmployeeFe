import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { LeaveApiService } from '@core/services/leave-api.service';
import { LeaveTypeDto, SaveLeaveTypeDto } from '@core/models/leave-api.model';
import { AdminLeavePolicy, AdminLeavePolicyStatus } from '../models/admin-leave-policy.model';

@Injectable({ providedIn: 'root' })
export class AdminLeavePolicyService {
  constructor(private readonly leaveApi: LeaveApiService) {}

  getPolicies(): Observable<AdminLeavePolicy[]> {
    return this.leaveApi.getLeaveTypes(true).pipe(map((items) => items.map((item) => this.toPolicy(item))));
  }

  savePolicy(id: number | null, policy: AdminLeavePolicy): Observable<AdminLeavePolicy> {
    const request: SaveLeaveTypeDto = {
      code: policy.code,
      name: policy.name,
      annualQuota: policy.annualQuota,
      carryoverDays: policy.carryoverDays,
      paidLeave: policy.paidLeave,
      requireDocument: policy.requireDocument,
      active: policy.status === 'Đang áp dụng',
      description: policy.description,
    };
    return this.leaveApi.saveLeaveType(id, request).pipe(map((item) => this.toPolicy(item)));
  }

  deletePolicy(id: number): Observable<void> {
    return this.leaveApi.deleteLeaveType(id);
  }

  private toPolicy(item: LeaveTypeDto): AdminLeavePolicy {
    return {
      id: item.id,
      code: item.code,
      name: item.name,
      annualQuota: Number(item.annualQuota ?? 0),
      carryoverDays: Number(item.carryoverDays ?? 0),
      paidLeave: Boolean(item.paidLeave),
      requireDocument: Boolean(item.requireDocument),
      status: item.active ? 'Đang áp dụng' : 'Tạm khóa',
      description: item.description || '',
    };
  }
}
