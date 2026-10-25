import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, catchError, expand, forkJoin, map, of, reduce } from 'rxjs';
import { AttendanceApiService } from '@core/services/attendance-api.service';
import { AttendanceRecordDto } from '@core/models/attendance.model';
import { SsButtonComponent, SsCardComponent, SsStatComponent, SsTagComponent } from '@platform/ui-kit';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { AdminEmployeeService } from '../../employees/services/admin-employee.service';
import { EmployeeResponse } from '../../employees/models/admin-employee.model';
import { AdminLeaveRequestService } from '../../leaves/services/admin-leave-request.service';
import { AdminPayrollRunService } from '../../payroll-runs/services/admin-payroll-run.service';
import { AdminPayrollRun } from '../../payroll-runs/models/admin-payroll-run.model';
import { OrgUnitService } from '../../organization/services/org-unit.service';
import { DepartmentResponse } from '../../organization/models/response.model';
import { AdminLeaveRequest } from '../../leaves/models/admin-leave-request.model';

interface HrQuickAction {
  label: string;
  description: string;
  icon: string;
  path: string;
  tone: string;
}

interface HrAlert {
  title: string;
  description: string;
  status: 'warning' | 'info' | 'success';
  statusLabel: string;
  icon: string;
  path: string;
}

interface AttendanceTrendPoint {
  label: string;
  value: number;
  heightPercent: number;
}

@Component({
  selector: 'app-executive-dashboard',
  standalone: true,
  imports: [CommonModule, NzIconModule, SsButtonComponent, SsCardComponent, SsStatComponent, SsTagComponent],
  templateUrl: './executive-dashboard.component.html',
  styleUrl: './executive-dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExecutiveDashboardComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly employeeService = inject(AdminEmployeeService);
  private readonly organizationService = inject(OrgUnitService);
  private readonly attendanceService = inject(AttendanceApiService);
  private readonly leaveService = inject(AdminLeaveRequestService);
  private readonly payrollService = inject(AdminPayrollRunService);

  readonly employees = signal<EmployeeResponse[] | null>(null);
  readonly departments = signal<DepartmentResponse[] | null>(null);
  readonly attendanceRecords = signal<AttendanceRecordDto[] | null>(null);
  readonly leaveRequests = signal<AdminLeaveRequest[] | null>(null);
  readonly payrollRuns = signal<AdminPayrollRun[] | null>(null);
  readonly loading = signal(true);
  readonly lastUpdated = signal('');

  readonly currentPeriod = computed(() => {
    const now = new Date();
    return `Tháng ${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
  });
  readonly sourceStatus = computed(() => {
    if (this.loading()) return 'Đang tải dữ liệu từ các phân hệ';
    const sources = [this.employees(), this.departments(), this.attendanceRecords(), this.leaveRequests(), this.payrollRuns()];
    return sources.every((source) => source !== null)
      ? 'Dữ liệu trực tiếp từ hệ thống'
      : 'Một số nguồn dữ liệu chưa tải được';
  });
  readonly totalEmployees = computed<number | string>(() => this.employees()?.length ?? '—');
  readonly activeEmployees = computed(() => this.employees()?.filter((employee) => employee.status === 'Đang làm việc').length ?? null);
  readonly attendanceCount = computed(() => {
    const records = this.attendanceRecords();
    return records === null ? null : records.filter((record) => Boolean(record.checkIn || record.checkOut)).length;
  });
  readonly pendingLeaveCount = computed(() => {
    const requests = this.leaveRequests();
    return requests === null ? null : requests.filter((request) => request.status === 'Chờ duyệt').length;
  });
  readonly latestPayrollRun = computed(() => {
    const runs = this.payrollRuns();
    return runs?.slice().sort((left, right) =>
      right.periodYear - left.periodYear || right.periodMonth - left.periodMonth || right.id - left.id,
    )[0] ?? null;
  });
  readonly payrollCostDisplay = computed(() => {
    if (this.payrollRuns() === null) return '—';
    const run = this.latestPayrollRun();
    return run ? this.formatCurrency(run.totalEmployerCost) : '—';
  });
  readonly payrollCostHint = computed(() => {
    if (this.payrollRuns() === null) return 'Không tải được dữ liệu kỳ lương';
    return this.latestPayrollRun()?.periodLabel ?? 'Chưa có kỳ lương';
  });
  readonly expiringContractCount = computed(() => {
    const employees = this.employees();
    if (employees === null) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(today);
    deadline.setDate(deadline.getDate() + 30);
    return employees.filter((employee) => {
      if (!employee.contractEnd) return false;
      const endDate = new Date(`${employee.contractEnd.slice(0, 10)}T00:00:00`);
      return !Number.isNaN(endDate.getTime()) && endDate >= today && endDate <= deadline;
    }).length;
  });
  readonly departmentStats = computed(() => {
    const employees = this.employees();
    if (employees === null) return [];
    const departmentNames = new Map((this.departments() ?? [])
      .filter((department) => !department.isDeleted)
      .map((department) => [department.deptCode, department.name]));
    const counts = new Map<string, { name: string; count: number }>();
    for (const employee of employees) {
      const code = employee.departmentCode ?? '';
      const name = employee.departmentName ?? departmentNames.get(code) ?? (code || 'Chưa phân bổ');
      const key = code || name;
      const entry = counts.get(key) ?? { name, count: 0 };
      entry.count += 1;
      counts.set(key, entry);
    }
    const palette = ['#1677ff', '#13c2c2', '#722ed1', '#fa8c16', '#52c41a', '#eb2f96'];
    const total = employees.length;
    return Array.from(counts.values())
      .sort((left, right) => right.count - left.count)
      .slice(0, 6)
      .map((department, index) => ({
        ...department,
        percentage: total ? Math.round((department.count / total) * 100) : 0,
        color: palette[index % palette.length],
      }));
  });
  readonly attendanceTrend = computed<AttendanceTrendPoint[]>(() => {
    const records = this.attendanceRecords();
    if (records === null) return [];
    const days: { label: string; date: string; employees: Set<string> }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let offset = 6; offset >= 0; offset -= 1) {
      const date = new Date(today);
      date.setDate(date.getDate() - offset);
      days.push({
        label: new Intl.DateTimeFormat('vi-VN', { weekday: 'short' }).format(date).replace('.', ''),
        date: this.toApiDate(date),
        employees: new Set<string>(),
      });
    }
    for (const record of records) {
      if (!record.checkIn && !record.checkOut) continue;
      const day = days.find((item) => item.date === record.recordedAt.slice(0, 10));
      if (day) day.employees.add(record.employeeCode);
    }
    const values = days.map((day) => day.employees.size);
    const max = Math.max(...values, 0);
    return days.map((day) => ({
      label: day.label,
      value: day.employees.size,
      heightPercent: max ? (day.employees.size / max) * 100 : 0,
    }));
  });
  readonly attendanceAxis = computed(() => {
    const max = Math.max(...this.attendanceTrend().map((day) => day.value), 0);
    return [max, Math.ceil(max / 2), 0];
  });
  readonly hasAttendanceEntries = computed(() => this.attendanceTrend().some((day) => day.value > 0));
  readonly attendanceDateRange = computed(() => {
    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    return `${this.toShortDate(start)} – ${this.toShortDate(end)}`;
  });
  readonly alerts = computed<HrAlert[]>(() => {
    if (this.loading() && [this.employees(), this.leaveRequests(), this.payrollRuns()].every((source) => source === null)) {
      return [{
        title: 'Đang tải dữ liệu nhân sự',
        description: 'Các cảnh báo sẽ được tổng hợp từ dữ liệu hiện có của hệ thống.',
        status: 'info',
        statusLabel: 'Đang tải',
        icon: 'sync',
        path: '/admin/employees',
      }];
    }

    const result: HrAlert[] = [];
    const pending = this.pendingLeaveCount();
    result.push(pending === null ? {
      title: 'Không tải được yêu cầu nghỉ phép',
      description: 'Mở phân hệ nghỉ phép để kiểm tra trạng thái dịch vụ.',
      status: 'info',
      statusLabel: 'Chưa có dữ liệu',
      icon: 'audit',
      path: '/admin/leaves',
    } : {
      title: pending ? `${pending} đơn nghỉ phép chờ duyệt` : 'Không có đơn nghỉ phép chờ duyệt',
      description: pending ? 'Các yêu cầu đang chờ xử lý trong phân hệ nghỉ phép.' : 'Danh sách yêu cầu hiện không có mục cần xử lý.',
      status: pending ? 'warning' : 'success',
      statusLabel: pending ? 'Cần xử lý' : 'Đã cập nhật',
      icon: 'audit',
      path: '/admin/leaves',
    });

    const expiring = this.expiringContractCount();
    result.push(expiring === null ? {
      title: 'Không tải được hồ sơ hợp đồng',
      description: 'Mở danh sách nhân viên để kiểm tra dữ liệu hạn hợp đồng.',
      status: 'info',
      statusLabel: 'Chưa có dữ liệu',
      icon: 'file-text',
      path: '/admin/employees',
    } : {
      title: expiring ? `${expiring} hợp đồng sắp hết hạn` : 'Không có hợp đồng sắp hết hạn',
      description: 'Tổng hợp hạn hợp đồng trong 30 ngày tới từ hồ sơ nhân viên.',
      status: expiring ? 'warning' : 'success',
      statusLabel: expiring ? 'Sắp đến hạn' : 'Ổn định',
      icon: 'file-text',
      path: '/admin/employees',
    });

    const payroll = this.latestPayrollRun();
    result.push(this.payrollRuns() === null ? {
      title: 'Không tải được kỳ tính lương',
      description: 'Mở phân hệ tính lương để kiểm tra trạng thái dịch vụ.',
      status: 'info',
      statusLabel: 'Chưa có dữ liệu',
      icon: 'calculator',
      path: '/admin/payroll-runs',
    } : payroll ? {
      title: `Kỳ lương ${payroll.periodLabel}: ${payroll.status}`,
      description: `${payroll.employeeCount} nhân viên · Tổng chi phí ${this.formatCurrency(payroll.totalEmployerCost)}.`,
      status: payroll.status === 'Chờ duyệt' ? 'warning' : payroll.status === 'Đã trả' ? 'success' : 'info',
      statusLabel: payroll.status,
      icon: 'calculator',
      path: '/admin/payroll-runs',
    } : {
      title: 'Chưa có kỳ tính lương',
      description: 'Tạo kỳ lương trong phân hệ tính lương để xem tổng chi phí.',
      status: 'info',
      statusLabel: 'Chưa có dữ liệu',
      icon: 'calculator',
      path: '/admin/payroll-runs',
    });
    return result;
  });

  readonly quickActions: HrQuickAction[] = [
    { label: 'Thêm nhân viên', description: 'Tạo hồ sơ nhân sự mới', icon: 'user-add', path: '/admin/employees', tone: 'blue' },
    { label: 'Duyệt đơn nghỉ phép', description: 'Xử lý các đơn đang chờ', icon: 'check-circle', path: '/admin/leaves', tone: 'purple' },
    { label: 'Quản lý chấm công', description: 'Theo dõi công và ca làm', icon: 'calendar', path: '/admin/attendance', tone: 'orange' },
    { label: 'Kỳ tính lương', description: 'Kiểm tra tiến độ payroll', icon: 'calculator', path: '/admin/payroll-runs', tone: 'green' },
  ];

  ngOnInit(): void {
    const { from, to } = this.getAttendanceRange();
    forkJoin({
      employees: this.employeeService.getEmployees().pipe(
        map(({ data }) => (data ?? []).filter((employee) => !employee.isDeleted)),
        catchError(() => of(null)),
      ),
      departments: this.organizationService.getDepartments().pipe(
        map(({ data }) => (data ?? []).filter((department) => !department.isDeleted)),
        catchError(() => of(null)),
      ),
      attendance: this.loadAttendanceRecords(from, to),
      leaveRequests: this.leaveService.getRequests().pipe(catchError(() => of(null))),
      payrollRuns: this.payrollService.getRuns().pipe(catchError(() => of(null))),
    }).subscribe((data) => {
      this.employees.set(data.employees);
      this.departments.set(data.departments);
      this.attendanceRecords.set(data.attendance);
      this.leaveRequests.set(data.leaveRequests);
      this.payrollRuns.set(data.payrollRuns);
      this.lastUpdated.set(new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(new Date()));
      this.loading.set(false);
    });
  }

  open(path: string): void {
    void this.router.navigateByUrl(path);
  }

  formatCurrency(amount: number): string {
    return `${new Intl.NumberFormat('vi-VN').format(amount)} VNĐ`;
  }

  private loadAttendanceRecords(from: string, to: string) {
    const pageSize = 200;
    const search = (page: number) => this.attendanceService.searchRecords({ from, to, page, size: pageSize });
    return search(0).pipe(
      expand((response) => response.data.last ? EMPTY : search(response.data.page + 1)),
      reduce((records, response) => records.concat(response.data.content ?? []), [] as AttendanceRecordDto[]),
      catchError(() => of(null)),
    );
  }

  private getAttendanceRange(): { from: string; to: string } {
    const to = new Date();
    to.setHours(0, 0, 0, 0);
    const from = new Date(to);
    from.setDate(from.getDate() - 6);
    return { from: this.toApiDate(from), to: this.toApiDate(to) };
  }

  private toApiDate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  private toShortDate(date: Date): string {
    return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(date);
  }
}
