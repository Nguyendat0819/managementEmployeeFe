import { Injectable } from '@angular/core';
import { ADMIN_LEAVE_REQUESTS } from '../data/admin-leave-request.mock';

@Injectable({ providedIn: 'root' })
export class AdminLeaveRequestService {
  readonly requests = ADMIN_LEAVE_REQUESTS.map((request) => ({ ...request }));
}
