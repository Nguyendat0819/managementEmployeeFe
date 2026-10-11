export type AdminAuditLogResult = 'Thành công' | 'Thất bại';

export interface AdminAuditLog {
  id: number;
  occurredAt: string;
  actor: string;
  actorName: string;
  action: string;
  module: string;
  target: string;
  result: AdminAuditLogResult;
  ipAddress: string;
  device: string;
  details: string;
}
