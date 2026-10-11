import { Routes } from '@angular/router';
import { ExecutiveDashboardComponent } from './components/executive-dashboard.component';

export const dashboardAdminRoutes: Routes = [
  {
    path: '',
    title: 'Executive Dashboard HR',
    component: ExecutiveDashboardComponent,
  },
];
