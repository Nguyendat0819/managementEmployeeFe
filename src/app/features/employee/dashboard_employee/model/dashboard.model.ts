export interface DashboardQuickAction {
  label: string;
  description: string;
  icon: string;
  path: string;
}

export type DashboardAnnouncementStatus = 'default' | 'info' | 'warning';

export interface DashboardAnnouncement {
  title: string;
  date: string;
  status: string;
  statusType: DashboardAnnouncementStatus;
}
