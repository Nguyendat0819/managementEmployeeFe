import { Routes } from '@angular/router';
import { AttendanceEmployeeComponent } from './components/attendance_employee.component';

export const attendanceEmployeeRoutes: Routes = [
  {
    path: '',
    title: 'Chấm công & Ca làm việc',
    component: AttendanceEmployeeComponent,
  },
];
