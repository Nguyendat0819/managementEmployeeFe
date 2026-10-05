import { Injectable } from '@angular/core';
import { MenuItem } from './menu-item.model';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly items: MenuItem[] = [
    // =========================================================
    // PHÂN HỆ NHÂN VIÊN - ESS PORTAL
    // =========================================================
    {
      id: 'ess',
      label: 'Nhân viên',
      icon: 'user',
      iconColor: '#1677ff',
      order: 10,
      roles: ['USER', 'ADMIN'],
      children: [
        {
          id: 'ess-dashboard',
          label: 'Trang chủ Dashboard cá nhân',
          icon: 'home',
          iconColor: '#52c41a',
          path: '/portal/dashboard',
          order: 10,
          roles: ['USER', 'ADMIN'],
          permissions: ['employee:dashboard:read'],
        },
        {
          id: 'ess-attendance',
          label: 'Chấm công & Ca làm việc',
          icon: 'calendar',
          iconColor: '#13c2c2',
          path: '/portal/attendance',
          order: 20,
          roles: ['USER', 'ADMIN'],
          permissions: ['employee:attendance:read'],
        },
        {
          id: 'ess-leaves',
          label: 'Nghỉ phép cá nhân',
          icon: 'solution',
          iconColor: '#722ed1',
          path: '/portal/leaves',
          order: 30,
          roles: ['USER', 'ADMIN'],
          permissions: ['employee:leave:read'],
        },
        {
          id: 'ess-profile',
          label: 'Hồ sơ & Hợp đồng',
          icon: 'idcard',
          iconColor: '#2f54eb',
          path: '/portal/profile',
          order: 40,
          roles: ['USER', 'ADMIN'],
          permissions: ['employee:profile:read'],
        },
        {
          id: 'ess-payslips',
          label: 'Phiếu lương điện tử',
          icon: 'file-text',
          iconColor: '#597ef7',
          path: '/portal/payslips',
          order: 50,
          roles: ['USER', 'ADMIN'],
          permissions: ['employee:payroll:read'],
        },
      ],
    },

    // =========================================================
    // THÔNG BÁO
    // =========================================================
    {
      id: 'notifications',
      label: 'Hộp thông báo',
      icon: 'bell',
      iconColor: '#faad14',
      path: '/portal/notifications',
      order: 20,
      roles: ['USER', 'ADMIN'],
      permissions: ['employee:notification:read'],
    },

    // =========================================================
    // PHÂN HỆ QUẢN LÝ & HR - ADMIN PORTAL
    // =========================================================
    {
      id: 'admin',
      label: 'Quản lý & HR',
      icon: 'setting',
      iconColor: '#722ed1',
      order: 30,
      roles: ['ADMIN'],
      children: [
        // -----------------------------------------------------
        // Dashboard
        // -----------------------------------------------------
        {
          id: 'admin-dashboard',
          label: 'Executive Dashboard HR',
          icon: 'dashboard',
          iconColor: '#1677ff',
          path: '/admin/dashboard',
          order: 10,
          roles: ['ADMIN'],
          permissions: ['employee:dashboard:read'],
        },

        // -----------------------------------------------------
        // Tổ chức & phòng ban
        // -----------------------------------------------------
        {
          id: 'admin-organization',
          label: 'Cơ cấu tổ chức & Phòng ban',
          icon: 'apartment',
          iconColor: '#13c2c2',
          path: '/admin/departments',
          order: 20,
          roles: ['ADMIN'],
          permissions: ['employee:organization:read'],
        },

        // -----------------------------------------------------
        // Hồ sơ nhân sự
        // -----------------------------------------------------
        {
          id: 'admin-employees',
          label: 'Hồ sơ Nhân sự & Hợp đồng',
          icon: 'team',
          iconColor: '#2f54eb',
          order: 30,
          roles: ['ADMIN'],
          children: [
            {
              id: 'admin-employee-list',
              label: 'Danh sách nhân viên',
              icon: 'team',
              iconColor: '#2f54eb',
              path: '/admin/employees',
              order: 10,
              roles: ['ADMIN'],
              permissions: ['employee:employee:read'],
            },
            {
              id: 'admin-contracts',
              label: 'Hợp đồng lao động',
              icon: 'file-text',
              iconColor: '#597ef7',
              path: '/admin/contracts',
              order: 20,
              roles: ['ADMIN'],
              permissions: ['employee:contract:read'],
            },
          ],
        },

        // -----------------------------------------------------
        // Chấm công & lịch nghỉ
        // -----------------------------------------------------
        {
          id: 'admin-attendance',
          label: 'Phân ca, Lịch nghỉ & Chấm công',
          icon: 'schedule',
          iconColor: '#fa8c16',
          order: 40,
          roles: ['ADMIN'],
          children: [
            {
              id: 'admin-shifts',
              label: 'Ca làm việc',
              icon: 'clock-circle',
              iconColor: '#fa8c16',
              path: '/admin/shifts',
              order: 10,
              roles: ['ADMIN'],
              permissions: ['employee:shift:read'],
            },
            {
              id: 'admin-shift-roster',
              label: 'Phân ca làm việc',
              icon: 'schedule',
              iconColor: '#fa8c16',
              path: '/admin/shift-roster',
              order: 20,
              roles: ['ADMIN'],
              permissions: ['employee:shift:manage'],
            },
            {
              id: 'admin-holidays',
              label: 'Ngày nghỉ lễ',
              icon: 'calendar',
              iconColor: '#13c2c2',
              path: '/admin/holidays',
              order: 30,
              roles: ['ADMIN'],
              permissions: ['employee:holiday:read'],
            },
            {
              id: 'admin-attendance-management',
              label: 'Quản lý chấm công',
              icon: 'check-circle',
              iconColor: '#52c41a',
              path: '/admin/attendance',
              order: 40,
              roles: ['ADMIN'],
              permissions: ['employee:attendance:manage'],
            },
          ],
        },

        // -----------------------------------------------------
        // Nghỉ phép
        // -----------------------------------------------------
        {
          id: 'admin-leaves',
          label: 'Trung tâm phê duyệt Đơn từ',
          icon: 'audit',
          iconColor: '#eb2f96',
          order: 50,
          roles: ['ADMIN'],
          children: [
            {
              id: 'admin-leave-requests',
              label: 'Duyệt đơn nghỉ phép',
              icon: 'check',
              iconColor: '#52c41a',
              path: '/admin/leaves',
              order: 10,
              roles: ['ADMIN'],
              permissions: ['employee:leave:approve'],
            },
            {
              id: 'admin-leave-settings',
              label: 'Cấu hình nghỉ phép',
              icon: 'setting',
              iconColor: '#722ed1',
              path: '/admin/leave-settings',
              order: 20,
              roles: ['ADMIN'],
              permissions: ['employee:leave:manage'],
            },
          ],
        },

        // -----------------------------------------------------
        // Payroll
        // -----------------------------------------------------
        {
          id: 'admin-payroll',
          label: 'Cấu hình & Kỳ tính lương Payroll',
          icon: 'dollar',
          iconColor: '#52c41a',
          order: 60,
          roles: ['ADMIN'],
          children: [
            {
              id: 'admin-salary-structures',
              label: 'Thang bảng lương',
              icon: 'database',
              iconColor: '#722ed1',
              path: '/admin/salary-structures',
              order: 10,
              roles: ['ADMIN'],
              permissions: ['employee:salary:read'],
            },
            {
              id: 'admin-payroll-runs',
              label: 'Kỳ tính lương',
              icon: 'calculator',
              iconColor: '#13c2c2',
              path: '/admin/payroll-runs',
              order: 20,
              roles: ['ADMIN'],
              permissions: ['employee:payroll:manage'],
            },
          ],
        },

        // -----------------------------------------------------
        // System
        // -----------------------------------------------------
        {
          id: 'admin-system',
          label: 'Tài khoản, Phân quyền & Audit Log',
          icon: 'safety',
          iconColor: '#f5222d',
          order: 70,
          roles: ['ADMIN'],
          children: [
            {
              id: 'admin-users',
              label: 'Tài khoản người dùng',
              icon: 'user',
              iconColor: '#1677ff',
              path: '/admin/users',
              order: 10,
              roles: ['ADMIN'],
              permissions: ['employee:user:read'],
            },
            {
              id: 'admin-roles-permissions',
              label: 'Vai trò & Phân quyền',
              icon: 'lock',
              iconColor: '#f5222d',
              path: '/admin/roles-permissions',
              order: 20,
              roles: ['ADMIN'],
              permissions: ['employee:role:manage'],
            },
            {
              id: 'admin-audit-logs',
              label: 'Audit Log',
              icon: 'file-search',
              iconColor: '#8c8c8c',
              path: '/admin/audit-logs',
              order: 30,
              roles: ['ADMIN'],
              permissions: ['employee:audit:read'],
            },
          ],
        },
      ],
    },
  ];

  private readonly normalizedItems: MenuItem[] = this.items
    .map((item) => ({
      ...item,
      children: item.children
        ? item.children.map((child) => ({ ...child })).sort((a, b) => a.order - b.order)
        : undefined,
    }))
    .sort((a, b) => a.order - b.order);

  getMenu(): MenuItem[] {
    return this.normalizedItems;
  }
}
