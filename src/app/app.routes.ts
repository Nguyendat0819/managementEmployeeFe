import { Routes } from '@angular/router';
import { authGuard } from '@core';
import { authRoutes } from './features/auth/auth.routes';
import { dashboardEmployeeRoutes } from './features/employee/dashboard_employee/dashboard_employee.routes';
import { myTasksRoutes } from './features/employee/tasks/my-tasks.routes';
import { taskManagementRoutes } from './features/admin/tasks/tasks.routes';
import { attendanceEmployeeRoutes } from './features/employee/attendance_employee/attendance_employee.routes';
import { leaveEmployeeRoutes } from './features/employee/leave_employee/leave_employee.routes';
import { profileEmployeeRoutes } from './features/employee/profile_employee/profile_employee.routes';
import { payslipEmployeeRoutes } from './features/employee/payslip_employee/payslip_employee.routes';
import { notificationEmployeeRoutes } from './features/employee/notification_employee/notification_employee.routes';
import { dashboardAdminRoutes } from './features/admin/dashboard_admin/dashboard_admin.routes';
import { organizationRoutes } from './features/admin/organization/organization.routes';
import { employeeAdminRoutes } from './features/admin/employees/employees.routes';
import { positionAdminRoutes } from './features/admin/positions/positions.routes';
import { shiftAdminRoutes } from './features/admin/shifts/shifts.routes';
import { shiftRosterAdminRoutes } from './features/admin/shift-roster/shift-roster.routes';
import { holidayAdminRoutes } from './features/admin/holidays/holidays.routes';
import { attendanceAdminRoutes } from './features/admin/attendance/attendance.routes';
import { leaveAdminRoutes } from './features/admin/leaves/leaves.routes';
import { leaveSettingsAdminRoutes } from './features/admin/leave-settings/leave-settings.routes';
import { salaryStructureAdminRoutes } from './features/admin/salary-structures/salary-structures.routes';
import { payrollRunAdminRoutes } from './features/admin/payroll-runs/payroll-runs.routes';
import { userAdminRoutes } from './features/admin/users/users.routes';
import { rolesPermissionsAdminRoutes } from './features/admin/roles-permissions/roles-permissions.routes';
import { auditLogAdminRoutes } from './features/admin/audit-logs/audit-logs.routes';
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
            path: 'tasks',
            children: myTasksRoutes,
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
            path: 'positions',
            children: positionAdminRoutes,
          },
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
          {
            path: 'tasks',
            children: taskManagementRoutes,
          },
          {
            path: 'leaves',
            children: leaveAdminRoutes,
          },
          {
            path: 'leave-settings',
            children: leaveSettingsAdminRoutes,
          },
          {
            path: 'salary-structures',
            children: salaryStructureAdminRoutes,
          },
          {
            path: 'payroll-runs',
            children: payrollRunAdminRoutes,
          },
          {
            path: 'users',
            children: userAdminRoutes,
          },
          {
            path: 'roles-permissions',
            children: rolesPermissionsAdminRoutes,
          },
          {
            path: 'audit-logs',
            children: auditLogAdminRoutes,
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
