import { Routes } from '@angular/router';
import { AdminNotificationPageComponent } from './components/admin-notification-page.component';

export const adminNotificationsRoutes: Routes = [
  {
    path: '',
    title: 'Gửi thông báo',
    component: AdminNotificationPageComponent,
  },
];
