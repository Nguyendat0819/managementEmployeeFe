import { Routes } from '@angular/router';
import { authGuard } from '@core';
import { authRoutes } from './features/auth/auth.routes';
import { dashboardEmployeeRoutes } from './features/employee/dashboard_employee/dashboard_employee.routes';
import { attendanceEmployeeRoutes } from './features/employee/attendance_employee/attendance_employee.routes';
import { leaveEmployeeRoutes } from './features/employee/leave_employee/leave_employee.routes';
import { profileEmployeeRoutes } from './features/employee/profile_employee/profile_employee.routes';
import { payslipEmployeeRoutes } from './features/employee/payslip_employee/payslip_employee.routes';
import { notificationEmployeeRoutes } from './features/employee/notification_employee/notification_employee.routes';
import { dashboardAdminRoutes } from './features/admin/dashboard_admin/dashboard_admin.routes';
import { organizationRoutes } from './features/admin/organization/organization.routes';
import { employeeAdminRoutes } from './features/admin/employees/employees.routes';
import { shiftAdminRoutes } from './features/admin/shifts/shifts.routes';
import { shiftRosterAdminRoutes } from './features/admin/shift-roster/shift-roster.routes';
import { holidayAdminRoutes } from './features/admin/holidays/holidays.routes';
import { attendanceAdminRoutes } from './features/admin/attendance/attendance.routes';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  {
    path: 'login',
    children: authRoutes,
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'user/dashboard' },
      {
        path: 'dashboard',
        pathMatch: 'full',
        redirectTo: 'user/dashboard',
      },
      {
        path: 'user',
        children: [
          {
            path: 'dashboard',
            children: dashboardEmployeeRoutes,
          },
          {
            path: 'attendance',
            children: attendanceEmployeeRoutes,
          },
          {
            path: 'leaves',
            children: leaveEmployeeRoutes,
          },
          {
            path: 'profile',
            children: profileEmployeeRoutes,
          },
          {
            path: 'payslips',
            children: payslipEmployeeRoutes,
          },
          {
            path: 'notifications',
            children: notificationEmployeeRoutes,
          },
        ],
      },
      {
        path: 'admin',
        children: [
          {
            path: 'dashboard',
            children: dashboardAdminRoutes,
          },
          {
            path: 'departments',
            children: organizationRoutes,
          },
          ...employeeAdminRoutes,
          {
            path: 'shifts',
            children: shiftAdminRoutes,
          },
          {
            path: 'shift-roster',
            children: shiftRosterAdminRoutes,
          },
          {
            path: 'holidays',
            children: holidayAdminRoutes,
          },
          {
            path: 'attendance',
            children: attendanceAdminRoutes,
          },
        ],
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
