import { Routes } from '@angular/router';
import { LoginComponent } from './components/login.component';

export const authRoutes: Routes = [
  {
    path: '',
    title: 'Đăng nhập',
    component: LoginComponent,
  },
];
