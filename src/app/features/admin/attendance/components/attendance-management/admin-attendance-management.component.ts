import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { SsButtonComponent, SsCardComponent, SsDataTableComponent, SsDialogComponent, SsDtActionClick, SsDtButton, SsDtColumn, SsDtConfig, SsStatComponent, SsTagComponent, SsToastService } from '@platform/ui-kit';
import { AdminAttendanceRecord } from '../../models/admin-attendance.model';
import { AdminAttendanceService } from '../../services/admin-attendance.service';

type AttendanceStatus = AdminAttendanceRecord['status'];

interface AttendanceForm {
  checkIn: string;
  checkOut: string;
  status: AttendanceStatus;
  note: string;
}

@Component({
  selector: 'app-admin-attendance-management',
  standalone: true,
  imports: [CommonModule, FormsModule, NzIconModule, SsButtonComponent, SsCardComponent, SsDataTableComponent, SsDialogComponent, SsStatComponent, SsTagComponent],
  templateUrl: './admin-attendance-management.component.html',
  styleUrl: './admin-attendance-management.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAttendanceManagementComponent {
  private readonly attendanceService = inject(AdminAttendanceService);
  private readonly toast = inject(SsToastService);

  readonly records = signal(this.attendanceService.records);
  readonly selectedRecord = signal<AdminAttendanceRecord | null>(null);
  readonly detailVisible = signal(false);
  readonly adjustVisible = signal(false);
  readonly currentDate = 'Thứ Ba, 07/10/2025';
  readonly syncTime = 'Cập nhật lúc 08:45';
  readonly adjustForm: AttendanceForm = this.emptyAdjustForm();

  readonly weeklyTrend = [
    { label: 'T2', value: 92.8, bar: 73, present: 230 },
    { label: 'T3', value: 94.1, bar: 81, present: 233 },
    { label: 'T4', value: 93.5, bar: 77, present: 232 },
    { label: 'T5', value: 95.2, bar: 89, present: 237 },
    { label: 'T6', value: 94.6, bar: 84, present: 235 },
    { label: 'T7', value: 88.9, bar: 52, present: 176 },
    { label: 'CN', value: 86.7, bar: 42, present: 94 },
  ];

  readonly presenceBreakdown = [
    { label: 'Có mặt', value: 232, percentage: 94, color: '#32b36b' },
    { label: 'Đi muộn', value: 9, percentage: 4, color: '#f59f3d' },
    { label: 'Vắng mặt', value: 7, percentage: 2, color: '#ff6b6b' },
  ];

  readonly attentionItems = [
    { label: 'Đi muộn', count: 9, detail: 'Cần xác nhận lý do', icon: 'clock-circle', tone: 'late' },
    { label: 'Vắng mặt', count: 7, detail: 'Chưa có đơn nghỉ phép', icon: 'user-delete', tone: 'absent' },
    { label: 'Thiếu dữ liệu', count: 4, detail: 'Chưa ghi nhận check-out', icon: 'exclamation-circle', tone: 'missing' },
  ];

  readonly flowItems = [
    { label: 'Ca hành chính', value: '184 / 196', percentage: 94, color: '#4d8dff' },
    { label: 'Ca sáng', value: '28 / 30', percentage: 93, color: '#32b36b' },
    { label: 'Ca chiều', value: '16 / 17', percentage: 94, color: '#9c6cff' },
    { label: 'Ca đêm', value: '4 / 5', percentage: 80, color: '#f59f3d' },
  ];

  readonly attendanceColumns: SsDtColumn<AdminAttendanceRecord>[] = [
    { key: 'employeeCode', header: 'Mã NV', field: 'employeeCode', width: '120px', sortable: true, filterable: true },
    { key: 'employeeName', header: 'Nhân viên', field: 'employeeName', width: '190px', sortable: true, filterable: true },
    { key: 'department', header: 'Phòng ban', field: 'department', width: '180px', filterable: true },
    { key: 'shiftName', header: 'Ca làm việc', field: 'shiftName', width: '145px', filterable: true },
    { key: 'recordedAt', header: 'Ngày', field: 'recordedAt', width: '120px', sortable: true },
    { key: 'checkIn', header: 'Check-in', field: 'checkIn', width: '100px', align: 'center' },
    { key: 'checkOut', header: 'Check-out', field: 'checkOut', width: '100px', align: 'center' },
    { key: 'workDuration', header: 'Tổng giờ', field: 'workDuration', width: '105px', align: 'center' },
    { key: 'overtime', header: 'Tăng ca', field: 'overtime', width: '95px', align: 'center' },
    {
      key: 'status',
      header: 'Trạng thái',
      field: 'status',
      type: 'status',
      width: '135px',
      options: [
        { label: 'Có mặt', value: 'Có mặt', color: '#32b36b' },
        { label: 'Đi muộn', value: 'Đi muộn', color: '#f59f3d' },
        { label: 'Vắng mặt', value: 'Vắng mặt', color: '#ff6b6b' },
        { label: 'Thiếu dữ liệu', value: 'Thiếu dữ liệu', color: '#7d8da6' },
      ],
    },
  ];

  attendanceTableSettings: SsDtConfig<AdminAttendanceRecord> = {
    rowKey: 'id',
    title: 'Bản ghi chấm công hôm nay',
    description: 'Theo dõi từng lượt vào - ra và xử lý các trường hợp bất thường',
    cardIcon: 'check-circle',
    cardStatusLabel: '248 nhân sự',
    cardStatusType: 'success',
    searchable: true,
    searchPlaceholder: 'Tìm theo mã, tên, phòng ban hoặc trạng thái',
    showSort: true,
    showFilter: true,
    showSetting: true,
    showPagination: true,
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    primaryButtons: [
      { key: 'sync', label: 'Đồng bộ dữ liệu', type: 'primary', icon: 'sync' },
      { key: 'export', label: 'Xuất báo cáo', type: 'secondary', icon: 'download' },
    ],
    rowActions: [
      { key: 'detail', label: 'Xem chi tiết', icon: 'eye' },
      { key: 'adjust', label: 'Điều chỉnh', icon: 'edit' },
    ],
    quickFilters: [
      {
        key: 'status',
        placeholder: 'Tất cả trạng thái',
        options: [
          { label: 'Có mặt', value: 'Có mặt' },
          { label: 'Đi muộn', value: 'Đi muộn' },
          { label: 'Vắng mặt', value: 'Vắng mặt' },
          { label: 'Thiếu dữ liệu', value: 'Thiếu dữ liệu' },
        ],
      },
      {
        key: 'shiftName',
        placeholder: 'Tất cả ca làm việc',
        options: [
          { label: 'Ca hành chính', value: 'Ca hành chính' },
          { label: 'Ca sáng', value: 'Ca sáng' },
          { label: 'Ca chiều', value: 'Ca chiều' },
          { label: 'Ca đêm', value: 'Ca đêm' },
        ],
      },
    ],
    striped: true,
    size: 'small',
    scrollX: '1250px',
    emptyText: 'Không có bản ghi chấm công phù hợp',
  };

  onPrimaryClick(button: SsDtButton): void {
    if (button.key === 'sync') {
      this.toast.show({ severity: 'success', summary: 'Đồng bộ hoàn tất', detail: 'Dữ liệu từ máy chấm công đã được cập nhật.' });
      return;
    }
    if (button.key === 'export') {
      this.toast.show({ severity: 'info', summary: 'Đang chuẩn bị báo cáo', detail: 'Báo cáo chấm công ngày 07/10/2025 sẽ sẵn sàng trong ít phút.' });
    }
  }

  onActionClick(event: SsDtActionClick<AdminAttendanceRecord>): void {
    if (event.action.key === 'detail') {
      this.selectedRecord.set(event.row);
      this.detailVisible.set(true);
      return;
    }
    if (event.action.key === 'adjust') this.openAdjustDialog(event.row);
  }

  closeDetail(): void {
    this.detailVisible.set(false);
  }

  openAdjustDialog(record: AdminAttendanceRecord): void {
    this.selectedRecord.set(record);
    Object.assign(this.adjustForm, {
      checkIn: record.checkIn === '--:--' ? '' : record.checkIn,
      checkOut: record.checkOut === '--:--' ? '' : record.checkOut,
      status: record.status,
      note: record.note,
    });
    this.adjustVisible.set(true);
  }

  closeAdjustDialog(): void {
    this.adjustVisible.set(false);
  }

  saveAdjustment(formValid: boolean): void {
    const record = this.selectedRecord();
    if (!record || !formValid) return;

    const duration = this.calculateDuration(this.adjustForm.checkIn, this.adjustForm.checkOut);
    const updatedRecord: AdminAttendanceRecord = {
      ...record,
      checkIn: this.adjustForm.checkIn || '--:--',
      checkOut: this.adjustForm.checkOut || '--:--',
      workDuration: this.formatDuration(duration),
      overtime: this.formatDuration(duration === null ? null : Math.max(0, duration - 480)),
      status: this.adjustForm.status,
      note: this.adjustForm.note.trim(),
    };

    this.records.update((records) => records.map((item) => item.id === record.id ? updatedRecord : item));
    this.selectedRecord.set(updatedRecord);
    this.closeAdjustDialog();
    this.toast.show({ severity: 'success', summary: 'Đã lưu điều chỉnh', detail: `Bản ghi của ${record.employeeName} đã được cập nhật.` });
  }

  showAttention(label: string): void {
    this.toast.show({ severity: 'info', summary: label, detail: 'Bạn có thể lọc nhanh danh sách bên dưới để xử lý từng bản ghi.' });
  }

  statusTone(status: AttendanceStatus): 'success' | 'warning' | 'error' | 'info' {
    if (status === 'Có mặt') return 'success';
    if (status === 'Đi muộn') return 'warning';
    if (status === 'Vắng mặt') return 'error';
    return 'info';
  }

  initials(name: string): string {
    return name.split(' ').slice(-2).map((part) => part[0]).join('');
  }

  private emptyAdjustForm(): AttendanceForm {
    return { checkIn: '', checkOut: '', status: 'Có mặt', note: '' };
  }

  private calculateDuration(checkIn: string, checkOut: string): number | null {
    if (!checkIn || !checkOut) return null;
    const [inHour, inMinute] = checkIn.split(':').map(Number);
    const [outHour, outMinute] = checkOut.split(':').map(Number);
    if ([inHour, inMinute, outHour, outMinute].some(Number.isNaN)) return null;
    const start = inHour * 60 + inMinute;
    let end = outHour * 60 + outMinute;
    if (end < start) end += 1440;
    return end - start;
  }

  private formatDuration(minutes: number | null): string {
    if (minutes === null) return '--:--';
    return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
  }
}
