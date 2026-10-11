import { Injectable } from '@angular/core';
import { ADMIN_LEAVE_POLICIES } from '../data/admin-leave-policy.mock';

@Injectable({ providedIn: 'root' })
export class AdminLeavePolicyService {
  readonly policies = ADMIN_LEAVE_POLICIES.map((policy) => ({ ...policy }));
}
