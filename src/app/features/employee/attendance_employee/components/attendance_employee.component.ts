import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { SsButtonComponent, SsCardComponent, SsCardFooterStartDirective, SsDataTableComponent, SsDescriptionsComponent, SsDtColumn, SsDtConfig, SsStatComponent, SsTagComponent, SsToastService } from '@platform/ui-kit';
import { AttendanceRecord } from '../model/attendance_employee.model';
import { AttendanceEmployeeService } from '../service/attendance_employee.service';
import { ProfileEmployeeService } from '../../profile_employee/service/profile_employee.service';
import { AttendanceRecordDto } from '@core/models/attendance.model';
import { ShiftAssignmentDto } from '@core/models/work-schedule.model';
import { WorkScheduleApiService } from '@core/services/work-schedule-api.service';

@Component({
  selector: 'app-attendance-employee',
  standalone: true,
  imports: [CommonModule, SsButtonComponent, SsCardComponent, SsCardFooterStartDirective, SsDataTableComponent, SsDescriptionsComponent, SsStatComponent, SsTagComponent],
  templateUrl: './attendance_employee.component.html',
  styleUrl: './attendance_employee.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttendanceEmployeeComponent implements OnInit {
  private readonly attendanceService = inject(AttendanceEmployeeService);
  private readonly scheduleApi = inject(WorkScheduleApiService);
  private readonly profileService = inject(ProfileEmployeeService);
  private readonly toast = inject(SsToastService);

  readonly records = signal<AttendanceRecord[]>([]);
  readonly employeeCode = signal('');
  readonly actionLoading = signal(false);
  readonly checkedIn = signal(false);
  readonly checkedOut = signal(false);
  readonly checkInTime = signal('--:--');
  readonly checkOutTime = signal('--:--');
  readonly currentShift = signal<ShiftAssignmentDto | null>(null);
  readonly currentMonthLabel = new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(new Date());
  readonly workDays = computed(() => this.records().filter((record) => record.checkIn !== '--:--').length);
  readonly totalWorkMinutes = computed(() => this.records().reduce((total, record) => total + (record.durationMinutes ?? 0), 0));
  readonly workHours = computed(() => this.formatWorkDuration(this.totalWorkMinutes()));
  readonly workHoursHint = computed(() => 'Tổng thời gian từ các bản ghi đã tải');
  readonly lateDays = computed(() => this.records().filter((record) => record.status === 'Đi muộn').length);
  readonly totalOvertimeMinutes = computed(() => this.records().reduce((total, record) => total + (record.overtimeMinutes ?? 0), 0));
  readonly overtimeHours = computed(() => this.formatWorkDuration(this.totalOvertimeMinutes()));
  readonly overtimeHoursHint = computed(() => this.records().some((record) => record.status === 'Chưa có ca')
    ? 'Chưa tính tăng ca cho ngày chưa được phân ca'
    : 'Tổng thời gian tăng ca từ các bản ghi đã tải');
  readonly currentShiftDescription = computed(() => {
    const shift = this.currentShift();
    return shift?.startTime && shift.endTime
      ? `${shift.startTime.slice(0, 5)} - ${shift.endTime.slice(0, 5)}`
      : 'Chưa có thông tin ca được phân công';
  });
  readonly currentShiftName = computed(() => this.currentShift()?.shiftName ?? 'Chưa được phân ca');
  readonly currentShiftDays = computed(() => this.currentShift()?.dayOfWeek?.join(' · ') ?? 'Chưa có dữ liệu ngày làm');
  readonly currentShiftStatus = computed(() => {
    const days = this.currentShift()?.dayOfWeek;
    if (!this.currentShift()) return 'Chưa được phân ca';
    if (!days?.length) return 'Chưa cấu hình ngày làm';
    return days.includes(this.todayDayCode()) ? 'Có lịch ca hôm nay' : 'Không có ca hôm nay';
  });
  readonly attendanceDetails = computed(() => [
    { label: 'Check-in thực tế', value: this.checkInTime() },
    { label: 'Check-out thực tế', value: this.checkOutTime() },
    { label: 'Trạng thái ghi nhận', value: this.timeStatusValue() },
  ]);
  readonly shiftDetails = computed(() => [
    { label: 'Tên ca', value: this.currentShiftName() },
    { label: 'Khung giờ', value: this.currentShiftDescription() },
    { label: 'Ngày làm', value: this.currentShiftDays() },
    { label: 'Trạng thái', value: this.currentShiftStatus() },
  ]);
  readonly attendanceColumns: SsDtColumn<AttendanceRecord>[] = [
    { key: 'date', header: 'Ngày', format: (row) => row.weekday + ', ' + row.date, width: '150px' },
    { key: 'shiftName', header: 'Ca làm việc', field: 'shiftName', filterable: true },
    { key: 'checkIn', header: 'Check-in', field: 'checkIn', align: 'center', width: '110px' },
    { key: 'checkOut', header: 'Check-out', field: 'checkOut', align: 'center', width: '110px' },
    { key: 'duration', header: 'Thời lượng', field: 'duration', align: 'center', width: '150px' },
    { key: 'status', header: 'Trạng thái', field: 'status', filterable: true, width: '140px' },
  ];
  readonly attendanceTableSettings: SsDtConfig<AttendanceRecord> = {
    rowKey: 'date',
    title: 'Lịch chấm công',
    description: 'Các bản ghi chấm công gần đây',
    cardIcon: 'history',
    cardStatusLabel: this.currentMonthLabel,
    cardStatusType: 'info',
    searchable: true,
    searchPlaceholder: 'Tìm theo ngày hoặc ca làm việc',
    showSort: true,
    showFilter: true,
    showSetting: true,
    showPagination: true,
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    striped: true,
    size: 'small',
    scrollY: '280px',
    emptyText: 'Chưa có dữ liệu chấm công',
  };

  readonly timeStatusValue = computed(() => this.checkedOut() ? 'Đã hoàn tất' : this.checkedIn() ? 'Đang làm việc' : '--');

  ngOnInit(): void {
    this.profileService.getCurrentProfile().subscribe({
      next: ({ data }) => {
        this.employeeCode.set(data.employeeCode);
        const today = this.toApiDate(new Date());
        this.scheduleApi.getCurrentAssignment(data.employeeCode, today).subscribe({
          next: ({ data: assignment }) => this.currentShift.set(assignment),
        });
        const monthStart = `${today.slice(0, 7)}-01`;
        this.attendanceService.getHistory(data.employeeCode, monthStart, today).subscribe({
          next: (records) => {
            this.records.set(records);
            const todayLabel = this.toDisplayDate(new Date());
            const todayRecord = records.find((record) => record.date === todayLabel);
            this.applyCurrentRecord(todayRecord);
          },
        });
      },
      error: () => this.profileService.markProfileUnavailable(),
    });
  }

  toggleAttendance(): void {
    const employeeCode = this.employeeCode();
    if (!employeeCode || this.checkedOut() || this.actionLoading()) return;
    this.actionLoading.set(true);
    if (!this.checkedIn()) {
      this.attendanceService.checkIn(employeeCode).subscribe({
        next: (record) => {
          this.applyCurrentRecord(this.attendanceService.toViewModel(record));
          this.refreshHistory();
          if (record.lateMinutes && record.lateMinutes > 0) {
            const plannedStart = record.scheduledStartTime?.slice(0, 5);
            this.toast.show({
              severity: 'error',
              summary: 'Bạn đi muộn',
              detail: `Bạn check-in muộn ${record.lateMinutes} phút${plannedStart ? ` (ca bắt đầu lúc ${plannedStart})` : ''}.`,
            });
          } else if (record.earlyMinutes && record.earlyMinutes > 0) {
            this.toast.show({
              severity: 'info',
              summary: 'Bạn đi sớm',
              detail: `Bạn check-in sớm ${record.earlyMinutes} phút so với giờ bắt đầu ca.`,
            });
          } else if (record.status === 'NO_SHIFT') {
            this.toast.show({
              severity: 'warning',
              summary: 'Đã check-in nhưng chưa có ca',
              detail: 'Hệ thống đã ghi nhận giờ vào nhưng chưa thể tính đi muộn hoặc tăng ca khi chưa được phân ca.',
            });
          } else {
            this.toast.show({ severity: 'success', summary: 'Check-in thành công', detail: `Bạn đã bắt đầu ca làm việc lúc ${this.checkInTime()}.` });
          }
        },
        error: () => this.actionLoading.set(false),
        complete: () => this.actionLoading.set(false),
      });
      return;
    }
    this.attendanceService.checkOut(employeeCode).subscribe({
        next: (record) => {
          this.applyCurrentRecord(this.attendanceService.toViewModel(record));
          this.refreshHistory();
          this.toast.show({
            severity: 'success',
            summary: 'Check-out thành công',
            detail: `Đã lưu tổng thời gian làm: ${this.formatWorkDuration(record.workDurationMin)}.`,
          });
      },
      error: () => this.actionLoading.set(false),
      complete: () => this.actionLoading.set(false),
    });
  }

  private refreshHistory(): void {
    const today = this.toApiDate(new Date());
    this.attendanceService.getHistory(this.employeeCode(), `${today.slice(0, 7)}-01`, today).subscribe({
      next: (records) => this.records.set(records),
    });
  }

  private applyCurrentRecord(record?: AttendanceRecord): void {
    this.checkedIn.set(!!record?.checkIn && record.checkOut === '--:--');
    this.checkedOut.set(!!record?.checkOut && record.checkOut !== '--:--');
    this.checkInTime.set(record?.checkIn ?? '--:--');
    this.checkOutTime.set(record?.checkOut ?? '--:--');
  }

  private toApiDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private toDisplayDate(date: Date): string {
    return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
  }

  private formatWorkDuration(minutes: number | null): string {
    if (minutes === null || !Number.isFinite(minutes) || minutes < 0) return '-';
    if (minutes < 60) return `${minutes} phút`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} giờ ${remainingMinutes} phút`;
  }

  private todayDayCode(): string {
    const day = new Date().getDay();
    return day === 0 ? 'CN' : `T${day + 1}`;
  }
}
