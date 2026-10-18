import { Routes } from '@angular/router';
import { MyTasksComponent } from './components/my-tasks.component';

export const myTasksRoutes: Routes = [
  { path: '', title: 'Công việc của tôi', component: MyTasksComponent },
];
