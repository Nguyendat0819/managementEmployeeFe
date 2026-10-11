import { AdminLeavePolicy } from '../models/admin-leave-policy.model';

export const ADMIN_LEAVE_POLICIES: AdminLeavePolicy[] = [
  { id: 1, code: 'ANNUAL', name: 'Phép năm', annualQuota: 12, carryoverDays: 5, paidLeave: true, requireDocument: false, status: 'Đang áp dụng', description: 'Ngày nghỉ phép thường niên theo thâm niên làm việc.' },
  { id: 2, code: 'SICK', name: 'Phép ốm', annualQuota: 30, carryoverDays: 0, paidLeave: true, requireDocument: true, status: 'Đang áp dụng', description: 'Áp dụng cho trường hợp nghỉ điều trị hoặc chăm sóc sức khỏe.' },
  { id: 3, code: 'SPECIAL', name: 'Phép đặc biệt', annualQuota: 3, carryoverDays: 0, paidLeave: true, requireDocument: true, status: 'Đang áp dụng', description: 'Nghỉ kết hôn, tang gia hoặc các trường hợp được quy định riêng.' },
  { id: 4, code: 'UNPAID', name: 'Phép không lương', annualQuota: 30, carryoverDays: 0, paidLeave: false, requireDocument: false, status: 'Đang áp dụng', description: 'Nghỉ theo thỏa thuận nhưng không hưởng lương trong thời gian nghỉ.' },
  { id: 5, code: 'MATERNITY', name: 'Nghỉ thai sản', annualQuota: 180, carryoverDays: 0, paidLeave: true, requireDocument: true, status: 'Tạm khóa', description: 'Chính sách nghỉ thai sản theo hồ sơ và quy định hiện hành.' },
];
