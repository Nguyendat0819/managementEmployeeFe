import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal, TemplateRef, ViewChild } from '@angular/core';
import { SsButtonComponent, SsDataTableComponent, SsDatepickerComponent, SsDialogComponent, SsDtActionClick, SsDtColumn, SsDtConfig, SsDtQuery, SsStatComponent, SsTagComponent } from '@platform/ui-kit';
import { AdminAttendanceRecord } from '../../models/admin-attendance.model';
import { AdminAttendanceService } from '../../services/admin-attendance.service';

@Component({
  selector: 'app-admin-attendance-management',
  standalone: true,
  imports: [CommonModule, FormsModule, SsButtonComponent, SsDataTableComponent, SsDatepickerComponent, SsDialogComponent, SsStatComponent, SsTagComponent],
  templateUrl: './admin-attendance-management.component.html',
  styleUrl: './admin-attendance-management.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAttendanceManagementComponent implements OnInit {
  private readonly attendanceService = inject(AdminAttendanceService);

  readonly records = signal<AdminAttendanceRecord[]>([]);
  readonly selectedRecord = signal<AdminAttendanceRecord | null>(null);
  readonly detailVisible = signal(false);
  readonly fromDate = signal(this.toApiDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
  readonly toDate = signal(this.toApiDate(new Date()));
  readonly dateRangeLabel = computed(() => `${this.toVietnameseDate(this.fromDate())} – ${this.toVietnameseDate(this.toDate())}`);
  @ViewChild('attendanceFilter', { static: true }) private attendanceFilter!: TemplateRef<unknown>;
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
    title: 'Bản ghi chấm công',
    description: 'Dữ liệu bản ghi được tải trực tiếp từ Attendance Service theo khoảng ngày đã chọn',
    cardIcon: 'check-circle',
    cardStatusLabel: 'Dữ liệu trực tiếp',
    cardStatusType: 'success',
    searchable: true,
    searchPlaceholder: 'Tìm theo mã nhân viên',
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
    this.attendanceTableSettings = {
      ...this.attendanceTableSettings,
      filterTemplate: this.attendanceFilter,
    };
    this.loadRecords(this.fromDate(), this.toDate());
  }

  onQueryChange(query: SsDtQuery): void {
    const from = query.filter['from'] || this.defaultFromDate();
    const to = query.filter['to'] || this.toApiDate(new Date());
    if (from > to || (from === this.fromDate() && to === this.toDate())) return;
    this.fromDate.set(from);
    this.toDate.set(to);
    this.loadRecords(from, to);
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

  private defaultFromDate(): string {
    return this.toApiDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  }

  private loadRecords(from: string, to: string): void {
    this.attendanceService.getRecords(from, to).subscribe({
      next: (records) => this.records.set(records),
    });
  }

  private toApiDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private toVietnameseDate(value: string): string {
    const [year, month, day] = value.split('-');
    return year && month && day ? `${day}/${month}/${year}` : value;
  }
}
