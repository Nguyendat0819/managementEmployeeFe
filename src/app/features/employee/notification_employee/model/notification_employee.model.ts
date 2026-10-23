export type NotificationType = 'info' | 'success' | 'warning' | 'default';

export interface EmployeeNotification {
  id: number;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  createdAtIso?: string;
  icon: string;
  type: NotificationType;
  read: boolean;
  referenceType?: string | null;
  referenceId?: number | null;
}
