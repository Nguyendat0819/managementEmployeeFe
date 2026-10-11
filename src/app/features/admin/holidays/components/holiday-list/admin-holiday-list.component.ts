import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SsButtonComponent, SsConfirmService, SsDataTableComponent, SsDialogComponent, SsDtActionClick, SsDtButton, SsDtColumn, SsDtConfig, SsStatComponent, SsTagComponent, SsToastService } from '@platform/ui-kit';
import { AdminHoliday } from '../../models/admin-holiday.model';
import { AdminHolidayService } from '../../services/admin-holiday.service';

@Component({
  selector: 'app-admin-holiday-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SsButtonComponent, SsDataTableComponent, SsDialogComponent, SsStatComponent, SsTagComponent],
  templateUrl: './admin-holiday-list.component.html',
  styleUrl: './admin-holiday-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminHolidayListComponent {
  private readonly holidayService = inject(AdminHolidayService);
  private readonly toast = inject(SsToastService);
  private readonly confirmService = inject(SsConfirmService);

  readonly holidays = signal(this.holidayService.holidays);
  readonly selectedHoliday = signal<AdminHoliday | null>(null);
  readonly detailVisible = signal(false);
  readonly formVisible = signal(false);
  readonly editingHoliday = signal<AdminHoliday | null>(null);
  readonly holidayForm = this.emptyHolidayForm();
  readonly holidayTypes = ['Ngày lễ quốc gia', 'Tết cổ truyền', 'Nghỉ bù', 'Ngày lễ khác'];
  readonly holidayColumns: SsDtColumn<AdminHoliday>[] = [
    { key: 'name', header: 'Tên ngày nghỉ', field: 'name', width: '240px', sortable: true, filterable: true },
    { key: 'holidayType', header: 'Loại ngày nghỉ', field: 'holidayType', width: '175px', filterable: true },
    { key: 'period', header: 'Thời gian nghỉ', format: (row) => row.holidayDate === row.holidayDateEnd ? row.holidayDate : `${row.holidayDate} - ${row.holidayDateEnd}`, width: '200px', sortable: true },
    { key: 'dayCount', header: 'Số ngày', type: 'number', format: (row) => `${row.dayCount} ngày`, width: '110px', align: 'right', sortable: true },
    { key: 'notes', header: 'Ghi chú', field: 'notes', width: '260px' },
    {
      key: 'status',
      header: 'Trạng thái',
      field: 'status',
      type: 'status',
      width: '130px',
      options: [
        { label: 'Sắp tới', value: 'Sắp tới', color: '#1677ff' },
        { label: 'Đang diễn ra', value: 'Đang diễn ra', color: '#52c41a' },
        { label: 'Đã qua', value: 'Đã qua', color: '#8c8c8c' },
      ],
    },
  ];
  holidayTableSettings: SsDtConfig<AdminHoliday> = {
    rowKey: 'id',
    title: 'Danh sách ngày nghỉ lễ',
    description: 'Thiết lập lịch nghỉ lễ và ngày nghỉ đặc biệt của công ty',
    cardIcon: 'calendar',
    cardStatusLabel: `${this.holidays().length} ngày nghỉ`,
    cardStatusType: 'info',
    primaryButtons: [{ key: 'create-holiday', label: 'Thêm mới', type: 'primary', icon: 'plus' }],
    searchable: true,
    searchPlaceholder: 'Tìm theo tên, loại ngày nghỉ hoặc ghi chú',
    showSort: true,
    showFilter: true,
    showSetting: true,
    showPagination: true,
    pageSize: 6,
    pageSizeOptions: [6, 10, 20],
    rowActions: [
      { key: 'detail', label: 'Xem ngày nghỉ', icon: 'eye' },
      { key: 'edit', label: 'Sửa', icon: 'edit' },
      { key: 'delete', label: 'Xóa', icon: 'delete', danger: true },
    ],
    quickFilters: [
      { key: 'status', placeholder: 'Tất cả trạng thái', options: [
        { label: 'Sắp tới', value: 'Sắp tới' },
        { label: 'Đang diễn ra', value: 'Đang diễn ra' },
        { label: 'Đã qua', value: 'Đã qua' },
      ] },
      { key: 'holidayType', placeholder: 'Tất cả loại ngày nghỉ', options: this.holidayTypes.map((type) => ({ label: type, value: type })) },
    ],
    striped: true,
    size: 'small',
    emptyText: 'Không có ngày nghỉ lễ phù hợp',
  };

  get upcomingCount(): number {
    return this.holidays().filter((holiday) => holiday.status === 'Sắp tới').length;
  }

  get totalDays(): number {
    return this.holidays().reduce((total, holiday) => total + holiday.dayCount, 0);
  }

  get nationalHolidayCount(): number {
    return this.holidays().filter((holiday) => holiday.holidayType === 'Ngày lễ quốc gia').length;
  }

  onPrimaryClick(button: SsDtButton): void {
    if (button.key === 'create-holiday') this.openCreateDialog();
  }

  onActionClick(event: SsDtActionClick<AdminHoliday>): void {
    if (event.action.key === 'detail') {
      this.selectedHoliday.set(event.row);
      this.detailVisible.set(true);
      return;
    }
    if (event.action.key === 'edit') {
      this.openEditDialog(event.row);
      return;
    }
    if (event.action.key === 'delete') void this.deleteHoliday(event.row);
  }

  closeDetail(): void {
    this.detailVisible.set(false);
  }

  openCreateDialog(): void {
    Object.assign(this.holidayForm, this.emptyHolidayForm());
    this.editingHoliday.set(null);
    this.formVisible.set(true);
  }

  openEditDialog(holiday: AdminHoliday): void {
    Object.assign(this.holidayForm, {
      name: holiday.name,
      holidayType: holiday.holidayType,
      holidayDate: this.toInputDate(holiday.holidayDate),
      holidayDateEnd: this.toInputDate(holiday.holidayDateEnd),
      notes: holiday.notes,
      status: holiday.status,
    });
    this.editingHoliday.set(holiday);
    this.formVisible.set(true);
  }

  closeFormDialog(): void {
    this.formVisible.set(false);
  }

  saveHoliday(formValid: boolean): void {
    if (!formValid) return;
    if (this.holidayForm.holidayDateEnd < this.holidayForm.holidayDate) {
      this.toast.show({ severity: 'warning', summary: 'Thời gian không hợp lệ', detail: 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.' });
      return;
    }

    const editingHoliday = this.editingHoliday();
    const holiday: AdminHoliday = {
      id: editingHoliday?.id ?? Date.now(),
      name: this.holidayForm.name.trim(),
      holidayType: this.holidayForm.holidayType,
      holidayDate: this.formatDate(this.holidayForm.holidayDate),
      holidayDateEnd: this.formatDate(this.holidayForm.holidayDateEnd),
      dayCount: this.calculateDays(this.holidayForm.holidayDate, this.holidayForm.holidayDateEnd),
      notes: this.holidayForm.notes.trim(),
      status: this.holidayForm.status,
    };

    this.holidays.update((holidays) => editingHoliday
      ? holidays.map((item) => item.id === editingHoliday.id ? holiday : item)
      : [...holidays, holiday]);
    this.holidayTableSettings = { ...this.holidayTableSettings, cardStatusLabel: `${this.holidays().length} ngày nghỉ` };
    this.closeFormDialog();
    this.toast.show({
      severity: 'success',
      summary: editingHoliday ? 'Cập nhật ngày nghỉ thành công' : 'Thêm ngày nghỉ thành công',
      detail: `${holiday.name} đã được ${editingHoliday ? 'cập nhật' : 'thêm vào danh sách'}.`,
    });
  }

  async deleteHoliday(holiday: AdminHoliday): Promise<void> {
    const confirmed = await this.confirmService.confirm(
      'Xác nhận xóa ngày nghỉ',
      `Bạn có chắc muốn xóa "${holiday.name}" khỏi lịch nghỉ không?`,
      { type: 'danger', okText: 'Xóa' },
    );
    if (!confirmed) return;

    this.holidays.update((holidays) => holidays.filter((item) => item.id !== holiday.id));
    this.holidayTableSettings = { ...this.holidayTableSettings, cardStatusLabel: `${this.holidays().length} ngày nghỉ` };
    this.toast.show({ severity: 'success', summary: 'Đã xóa ngày nghỉ', detail: `${holiday.name} đã được xóa khỏi danh sách.` });
  }

  holidayStatusType(status: AdminHoliday['status']): 'success' | 'info' | 'default' {
    if (status === 'Sắp tới') return 'info';
    if (status === 'Đã qua') return 'default';
    return 'success';
  }

  private emptyHolidayForm() {
    return {
      name: '',
      holidayType: 'Ngày lễ quốc gia',
      holidayDate: '',
      holidayDateEnd: '',
      notes: '',
      status: 'Sắp tới' as AdminHoliday['status'],
    };
  }

  private calculateDays(start: string, end: string): number {
    return Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1;
  }

  private toInputDate(value: string): string {
    const [day, month, year] = value.split('/');
    return year ? `${year}-${month}-${day}` : value;
  }

  private formatDate(value: string): string {
    const [year, month, day] = value.split('-');
    return day && month && year ? `${day}/${month}/${year}` : value;
  }
}
