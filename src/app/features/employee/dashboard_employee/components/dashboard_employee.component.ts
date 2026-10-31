import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@platform/shared';
import {
  SsButtonComponent,
  SsCardComponent,
  SsCardFooterStartDirective,
  SsStatComponent,
  SsTagComponent,
  SsToastService,
} from '@platform/ui-kit';
import { ShiftAssignmentDto } from '@core/models/work-schedule.model';
import { AttendanceEmployeeService } from '../../attendance_employee/service/attendance_employee.service';
import { AttendanceRecord } from '../../attendance_employee/model/attendance_employee.model';
import { WorkScheduleApiService } from '@core/services/work-schedule-api.service';
import { ProfileEmployeeService } from '../../profile_employee/service/profile_employee.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SsButtonComponent, SsCardComponent, SsCardFooterStartDirective, SsStatComponent, SsTagComponent],
  templateUrl: './dashboard_employee.component.html',
  styleUrl: './dashboard_employee.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardEmployeeComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly attendance = inject(AttendanceEmployeeService);
  private readonly scheduleApi = inject(WorkScheduleApiService);
  private readonly profileService = inject(ProfileEmployeeService);
  private readonly toast = inject(SsToastService);

  readonly today = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date());

  readonly employeeName = signal('Bạn');
  readonly employeeCode = signal('');
  readonly department = signal('');
  readonly records = signal<AttendanceRecord[]>([]);
  readonly shift = signal<ShiftAssignmentDto | null>(null);
  readonly profileLoading = signal(true);
  readonly actionLoading = signal(false);
  readonly checkedIn = signal(false);
  readonly checkedOut = signal(false);
  readonly checkInTime = signal('--:--');
  readonly checkOutTime = signal('--:--');
  readonly monthLabel = new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(new Date());
  readonly workedDays = computed(() => this.records().filter((record) => record.checkIn !== '--:--').length);
  readonly lateDays = computed(() => this.records().filter((record) => record.status === 'Đi muộn').length);
  readonly totalHours = computed(() => {
    const minutes = this.records().reduce((sum, record) => {
      const duration = record.durationMinutes;
      return typeof duration === 'number' && Number.isFinite(duration) && duration >= 0 ? sum + duration : sum;
    }, 0);
    return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}`;
  });
  readonly shiftLabel = computed(() => {
    const shift = this.shift();
    return shift?.startTime && shift.endTime
      ? `${shift.startTime.slice(0, 5)} – ${shift.endTime.slice(0, 5)}`
      : 'Chưa có ca được phân công';
  });
  readonly todayStatus = computed(() => this.checkedOut() ? 'Đã hoàn tất' : this.checkedIn() ? 'Đang làm việc' : 'Chưa check-in');
  readonly todayStatusType = computed(() => this.checkedIn() || this.checkedOut() ? 'success' : 'warning');

  get displayName(): string {
    if (this.employeeName() !== 'Bạn') return this.employeeName();
    const claims = this.auth.claims;
    for (const key of ['user', 'userName', 'username', 'name', 'preferred_username']) {
      const value = claims[key];
      if (typeof value === 'string' && value.trim()) return value;
    }
    return 'Bạn';
  }

  open(path: string): void {
    void this.router.navigateByUrl(path);
  }

  ngOnInit(): void {
    this.profileService.getCurrentProfile().subscribe({
      next: ({ data }) => {
        this.profileService.applyResponse(data);
        this.employeeCode.set(data.employeeCode);
        this.employeeName.set(data.fullName || 'Bạn');
        this.department.set(data.departmentName ?? data.departmentCode ?? '');
        const today = this.toApiDate(new Date());
        this.scheduleApi.getCurrentAssignment(data.employeeCode, today).subscribe({
          next: ({ data: assignment }) => this.shift.set(assignment),
        });
        this.loadHistory();
      },
      error: () => {
        this.profileService.markProfileUnavailable();
        this.profileLoading.set(false);
      },
      complete: () => this.profileLoading.set(false),
    });
  }

  toggleAttendance(): void {
    const employeeCode = this.employeeCode();
    if (!employeeCode || this.checkedOut() || this.actionLoading()) return;

    this.actionLoading.set(true);
    const request = this.checkedIn()
      ? this.attendance.checkOut(employeeCode)
      : this.attendance.checkIn(employeeCode);

    request.subscribe({
      next: (record) => {
        this.applyTodayRecord(this.attendance.toViewModel(record));
        this.loadHistory();
        this.toast.show({
          severity: 'success',
          summary: this.checkedOut() ? 'Check-out thành công' : 'Check-in thành công',
          detail: this.checkedOut() ? `Đã lưu giờ ra lúc ${this.checkOutTime()}.` : `Đã ghi nhận giờ vào lúc ${this.checkInTime()}.`,
        });
      },
      error: () => this.actionLoading.set(false),
      complete: () => this.actionLoading.set(false),
    });
  }

  private loadHistory(): void {
    const today = this.toApiDate(new Date());
    this.attendance.getHistory(this.employeeCode(), `${today.slice(0, 7)}-01`, today).subscribe({
      next: (records) => {
        this.records.set(records);
        const todayRecord = records.find((record) => record.date === this.toDisplayDate(new Date()));
        this.applyTodayRecord(todayRecord);
      },
    });
  }

  private applyTodayRecord(record?: AttendanceRecord): void {
    const inTime = record?.checkIn ?? '--:--';
    const outTime = record?.checkOut ?? '--:--';
    this.checkInTime.set(inTime);
    this.checkOutTime.set(outTime);
    this.checkedIn.set(inTime !== '--:--' && outTime === '--:--');
    this.checkedOut.set(outTime !== '--:--');
  }

  private toDisplayDate(date: Date): string {
    return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
  }

  private toApiDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
