import { Routes } from '@angular/router';
import { TaskManagementComponent } from './components/task-management.component';

export const taskManagementRoutes: Routes = [
  { path: '', title: 'Quản lý công việc', component: TaskManagementComponent },
];
