import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { SsButtonComponent, SsDataTableComponent, SsDialogComponent, SsDtActionClick, SsDtColumn, SsDtConfig, SsStatComponent, SsTagComponent } from '@platform/ui-kit';
import { AdminAttendanceRecord } from '../../models/admin-attendance.model';
import { AdminAttendanceService } from '../../services/admin-attendance.service';

@Component({
  selector: 'app-admin-attendance-management',
  standalone: true,
  imports: [CommonModule, SsButtonComponent, SsDataTableComponent, SsDialogComponent, SsStatComponent, SsTagComponent],
  templateUrl: './admin-attendance-management.component.html',
  styleUrl: './admin-attendance-management.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAttendanceManagementComponent implements OnInit {
  private readonly attendanceService = inject(AdminAttendanceService);

  readonly records = signal<AdminAttendanceRecord[]>([]);
  readonly selectedRecord = signal<AdminAttendanceRecord | null>(null);
  readonly detailVisible = signal(false);
  readonly currentDate = new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date());
  readonly recordCount = computed(() => this.records().length);
  readonly presentCount = computed(() => this.records().filter((record) => record.status === 'Có mặt' || record.status === 'Đi muộn').length);
  readonly lateCount = computed(() => this.records().filter((record) => record.status === 'Đi muộn').length);
  readonly incompleteCount = computed(() => this.records().filter((record) => record.status === 'Thiếu dữ liệu').length);

  readonly attendanceColumns: SsDtColumn<AdminAttendanceRecord>[] = [
    { key: 'employeeCode', header: 'Mã NV', field: 'employeeCode', width: '120px', sortable: true, filterable: true },
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
        { label: 'Chưa có ca', value: 'Chưa có ca', color: '#722ed1' },
      ],
    },
  ];

  attendanceTableSettings: SsDtConfig<AdminAttendanceRecord> = {
    rowKey: 'id',
    title: 'Bản ghi chấm công hôm nay',
    description: 'Dữ liệu bản ghi được tải trực tiếp từ Attendance Service',
    cardIcon: 'check-circle',
    cardStatusLabel: 'Dữ liệu trực tiếp',
    cardStatusType: 'success',
    searchable: true,
    searchPlaceholder: 'Tìm theo mã nhân viên hoặc trạng thái',
    showSort: true,
    showFilter: true,
    showSetting: true,
    showPagination: true,
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    rowActions: [
      { key: 'detail', label: 'Xem chi tiết', icon: 'eye' },
    ],
    quickFilters: [{
      key: 'status',
      placeholder: 'Tất cả trạng thái',
      options: [
        { label: 'Có mặt', value: 'Có mặt' },
        { label: 'Đi muộn', value: 'Đi muộn' },
        { label: 'Thiếu dữ liệu', value: 'Thiếu dữ liệu' },
        { label: 'Chưa có ca', value: 'Chưa có ca' },
      ],
    }],
    striped: true,
    size: 'small',
    scrollX: '1250px',
    emptyText: 'Không có bản ghi chấm công phù hợp',
  };

  ngOnInit(): void {
    const today = this.toApiDate(new Date());
    this.attendanceService.getRecords(today, today).subscribe({
      next: (records) => this.records.set(records),
    });
  }

  onActionClick(event: SsDtActionClick<AdminAttendanceRecord>): void {
    if (event.action.key === 'detail') {
      this.selectedRecord.set(event.row);
      this.detailVisible.set(true);
    }
  }

  closeDetail(): void {
    this.detailVisible.set(false);
  }

  statusTone(status: AdminAttendanceRecord['status']): 'success' | 'warning' | 'error' | 'info' {
    if (status === 'Có mặt') return 'success';
    if (status === 'Đi muộn') return 'warning';
    if (status === 'Vắng mặt') return 'error';
    return 'info';
  }

  initials(name: string): string {
    return name.split(' ').slice(-2).map((part) => part[0]).join('');
  }

  private toApiDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
