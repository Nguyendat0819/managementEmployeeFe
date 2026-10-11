import { Injectable } from '@angular/core';
import { ADMIN_USERS } from '../data/admin-user.mock';

@Injectable({ providedIn: 'root' })
export class AdminUserService {
  readonly users = ADMIN_USERS.map((user) => ({ ...user }));
}
