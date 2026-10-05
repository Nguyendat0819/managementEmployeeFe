import { Injectable } from '@angular/core';
import { MenuItem } from './menu-item.model';

@Injectable({ providedIn: 'root' })
export class MenuService {
  // private readonly items: MenuItem[] = [
  //   {
  //     id: 'dashboard',
  //     label: 'Trang chủ',
  //     icon: 'home',
  //     path: '/dashboard',
  //     order: 10,
  //   },
  //   {
  //     id: 'employees',
  //     label: 'Nhân viên',
  //     icon: 'team',
  //     order: 20,
  //     children: [
  //       {
  //         id: 'employee-list',
  //         label: 'Danh sách nhân viên',
  //         icon: 'ordered-list',
  //         path: '/employees',
  //         order: 10,
  //       },
  //       {
  //         id: 'employee-add',
  //         label: 'Thêm nhân viên',
  //         icon: 'user-add',
  //         path: '/employees/create',
  //         order: 20,
  //       },
  //     ],
  //   },
  //   {
  //     id: 'organization',
  //     label: 'Tổ chức',
  //     icon: 'apartment',
  //     order: 30,
  //     children: [
  //       {
  //         id: 'departments',
  //         label: 'Phòng ban',
  //         icon: 'cluster',
  //         path: '/departments',
  //         order: 10,
  //       },
  //       {
  //         id: 'positions',
  //         label: 'Chức vụ',
  //         icon: 'folder',
  //         path: '/positions',
  //         order: 20,
  //       },
  //     ],
  //   },
  //   {
  //     id: 'reports',
  //     label: 'Báo cáo',
  //     icon: 'file-excel',
  //     path: '/reports',
  //     order: 40,
  //   },
  // ];
  private readonly items: MenuItem[] = [
    // =========================================================
    // PHÂN HỆ NHÂN VIÊN - ESS PORTAL
    // =========================================================
    {
      id: 'ess',
      label: 'Nhân viên',
      icon: 'user',
      order: 10,
      children: [
        {
          id: 'ess-dashboard',
          label: 'Trang chủ Dashboard cá nhân',
          icon: 'home',
          path: '/portal/dashboard',
          order: 10,
        },
        {
          id: 'ess-attendance',
          label: 'Chấm công & Ca làm việc',
          icon: 'calendar',
          path: '/portal/attendance',
          order: 20,
        },
        {
          id: 'ess-leaves',
          label: 'Nghỉ phép cá nhân',
          icon: 'solution',
          path: '/portal/leaves',
          order: 30,
        },
        {
          id: 'ess-profile',
          label: 'Hồ sơ & Hợp đồng',
          icon: 'idcard',
          path: '/portal/profile',
          order: 40,
        },
        {
          id: 'ess-payslips',
          label: 'Phiếu lương điện tử',
          icon: 'file-text',
          path: '/portal/payslips',
          order: 50,
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
      path: '/portal/notifications',
      order: 20,
    },

    // =========================================================
    // PHÂN HỆ QUẢN LÝ & HR - ADMIN PORTAL
    // =========================================================
    {
      id: 'admin',
      label: 'Quản lý & HR',
      icon: 'setting',
      order: 30,
      children: [
        // -----------------------------------------------------
        // Dashboard
        // -----------------------------------------------------
        {
          id: 'admin-dashboard',
          label: 'Executive Dashboard HR',
          icon: 'dashboard',
          path: '/admin/dashboard',
          order: 10,
        },

        // -----------------------------------------------------
        // Tổ chức & phòng ban
        // -----------------------------------------------------
        {
          id: 'admin-organization',
          label: 'Cơ cấu tổ chức & Phòng ban',
          icon: 'apartment',
          path: '/admin/departments',
          order: 20,
        },

        // -----------------------------------------------------
        // Hồ sơ nhân sự
        // -----------------------------------------------------
        {
          id: 'admin-employees',
          label: 'Hồ sơ Nhân sự & Hợp đồng',
          icon: 'team',
          order: 30,
          children: [
            {
              id: 'admin-employee-list',
              label: 'Danh sách nhân viên',
              icon: 'team',
              path: '/admin/employees',
              order: 10,
            },
            {
              id: 'admin-contracts',
              label: 'Hợp đồng lao động',
              icon: 'file-text',
              path: '/admin/contracts',
              order: 20,
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
          order: 40,
          children: [
            {
              id: 'admin-shifts',
              label: 'Ca làm việc',
              icon: 'clock-circle',
              path: '/admin/shifts',
              order: 10,
            },
            {
              id: 'admin-shift-roster',
              label: 'Phân ca làm việc',
              icon: 'schedule',
              path: '/admin/shift-roster',
              order: 20,
            },
            {
              id: 'admin-holidays',
              label: 'Ngày nghỉ lễ',
              icon: 'calendar',
              path: '/admin/holidays',
              order: 30,
            },
            {
              id: 'admin-attendance-management',
              label: 'Quản lý chấm công',
              icon: 'check-circle',
              path: '/admin/attendance',
              order: 40,
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
          order: 50,
          children: [
            {
              id: 'admin-leave-requests',
              label: 'Duyệt đơn nghỉ phép',
              icon: 'check',
              path: '/admin/leaves',
              order: 10,
            },
            {
              id: 'admin-leave-settings',
              label: 'Cấu hình nghỉ phép',
              icon: 'setting',
              path: '/admin/leave-settings',
              order: 20,
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
          order: 60,
          children: [
            {
              id: 'admin-salary-structures',
              label: 'Thang bảng lương',
              icon: 'database',
              path: '/admin/salary-structures',
              order: 10,
            },
            {
              id: 'admin-payroll-runs',
              label: 'Kỳ tính lương',
              icon: 'calculator',
              path: '/admin/payroll-runs',
              order: 20,
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
          order: 70,
          children: [
            {
              id: 'admin-users',
              label: 'Tài khoản người dùng',
              icon: 'user',
              path: '/admin/users',
              order: 10,
            },
            {
              id: 'admin-roles-permissions',
              label: 'Vai trò & Phân quyền',
              icon: 'lock',
              path: '/admin/roles-permissions',
              order: 20,
            },
            {
              id: 'admin-audit-logs',
              label: 'Audit Log',
              icon: 'file-search',
              path: '/admin/audit-logs',
              order: 30,
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
