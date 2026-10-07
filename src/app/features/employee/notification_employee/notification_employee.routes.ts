import { Routes } from '@angular/router';
import { NotificationEmployeeComponent } from './components/notification_employee.component';

export const notificationEmployeeRoutes: Routes = [
  {
    path: '',
    title: 'Hộp thông báo',
    component: NotificationEmployeeComponent,
  },
];
