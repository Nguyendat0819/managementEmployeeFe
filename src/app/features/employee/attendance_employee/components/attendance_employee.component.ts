import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { SsButtonComponent, SsCardComponent, SsCardFooterStartDirective, SsDataTableComponent, SsDtColumn, SsDtConfig, SsStatComponent, SsTagComponent, SsToastService } from '@platform/ui-kit';
import { AttendanceRecord } from '../model/attendance_employee.model';
import { AttendanceEmployeeService } from '../service/attendance_employee.service';

@Component({
  selector: 'app-attendance-employee',
  standalone: true,
  imports: [CommonModule, SsButtonComponent, SsCardComponent, SsCardFooterStartDirective, SsDataTableComponent, SsStatComponent, SsTagComponent],
  templateUrl: './attendance_employee.component.html',
  styleUrl: './attendance_employee.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttendanceEmployeeComponent {
  private readonly attendanceService = inject(AttendanceEmployeeService);
  private readonly toast = inject(SsToastService);

  readonly records = this.attendanceService.records;
  readonly checkedIn = signal(false);
  readonly checkedOut = signal(false);
  readonly checkInTime = signal('--:--');
  readonly checkOutTime = signal('--:--');
  readonly attendanceColumns: SsDtColumn<AttendanceRecord>[] = [
    { key: 'date', header: 'Ngày', format: (row) => row.weekday + ', ' + row.date, width: '150px' },
    { key: 'shiftName', header: 'Ca làm việc', field: 'shiftName', filterable: true },
    { key: 'checkIn', header: 'Check-in', field: 'checkIn', align: 'center', width: '110px' },
    { key: 'checkOut', header: 'Check-out', field: 'checkOut', align: 'center', width: '110px' },
    { key: 'duration', header: 'Tổng giờ', field: 'duration', align: 'center', width: '110px' },
    { key: 'status', header: 'Trạng thái', field: 'status', filterable: true, width: '140px' },
  ];
  readonly attendanceTableSettings: SsDtConfig<AttendanceRecord> = {
    rowKey: 'date',
    title: 'Lịch chấm công',
    description: 'Các bản ghi chấm công gần đây',
    cardIcon: 'history',
    cardStatusLabel: 'Tháng 10/2025',
    cardStatusType: 'info',
    searchable: true,
    searchPlaceholder: 'Tìm theo ngày hoặc ca làm việc',
    showSort: true,
    showFilter: true,
    showSetting: true,
    showPagination: true,
    pageSize: 5,
    pageSizeOptions: [5, 10, 20],
    striped: true,
    size: 'small',
    scrollY: '280px',
    emptyText: 'Chưa có dữ liệu chấm công',
  };

  readonly timeStatusTitle = computed(() => {
    if (!this.checkedIn()) return 'Trạng thái giờ vào';
    const checkInMinutes = this.toMinutes(this.checkInTime());
    if (checkInMinutes > 480) return 'Đi muộn';
    if (checkInMinutes < 480) return 'Đi sớm';
    return 'Đúng giờ';
  });
  readonly timeStatusValue = computed(() => {
    if (!this.checkedIn()) return '--';
    const difference = this.toMinutes(this.checkInTime()) - 480;
    if (difference > 0) return '+' + difference + ' phút';
    if (difference < 0) return Math.abs(difference) + ' phút sớm';
    return 'Đúng giờ';
  });

  toggleAttendance(): void {
    if (this.checkedOut()) return;
    const now = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(new Date());
    if (!this.checkedIn()) {
      this.checkedIn.set(true);
      this.checkInTime.set(now);
      this.toast.show({ severity: 'success', summary: 'Check-in thành công', detail: 'Bạn đã bắt đầu ca làm việc lúc ' + this.checkInTime() + '.' });
      return;
    }
    this.checkedOut.set(true);
    this.checkOutTime.set(now);
    this.toast.show({ severity: 'success', summary: 'Check-out thành công', detail: 'Thời gian làm việc hôm nay đã được ghi nhận.' });
  }

  private toMinutes(value: string): number {
    if (value === '--:--') return 480;
    const [hours, minutes] = value.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
