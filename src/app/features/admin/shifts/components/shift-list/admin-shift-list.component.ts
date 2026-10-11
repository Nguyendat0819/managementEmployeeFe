import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SsButtonComponent, SsConfirmService, SsDataTableComponent, SsDialogComponent, SsDtActionClick, SsDtButton, SsDtColumn, SsDtConfig, SsStatComponent, SsTagComponent, SsToastService } from '@platform/ui-kit';
import { AdminShift } from '../../models/admin-shift.model';
import { AdminShiftService } from '../../services/admin-shift.service';

@Component({
  selector: 'app-admin-shift-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SsButtonComponent, SsDataTableComponent, SsDialogComponent, SsStatComponent, SsTagComponent],
  templateUrl: './admin-shift-list.component.html',
  styleUrl: './admin-shift-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminShiftListComponent {
  private readonly shiftService = inject(AdminShiftService);
  private readonly toast = inject(SsToastService);
  private readonly confirmService = inject(SsConfirmService);

  readonly shifts = signal(this.shiftService.shifts);
  readonly selectedShift = signal<AdminShift | null>(null);
  readonly detailVisible = signal(false);
  readonly formVisible = signal(false);
  readonly editingShift = signal<AdminShift | null>(null);
  readonly shiftForm = this.emptyShiftForm();
  readonly dayOptions = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  readonly shiftColumns: SsDtColumn<AdminShift>[] = [
    { key: 'shiftName', header: 'Tên ca làm việc', field: 'shiftName', width: '210px', sortable: true, filterable: true },
    { key: 'workingTime', header: 'Thời gian', format: (row) => `${row.startTime} - ${row.endTime}`, width: '155px', sortable: true },
    { key: 'dayLabel', header: 'Ngày áp dụng', field: 'dayLabel', width: '220px', filterable: true },
    { key: 'assignedCount', header: 'Nhân sự', type: 'number', format: (row) => `${row.assignedCount} người`, width: '130px', align: 'right', sortable: true },
    {
      key: 'status',
      header: 'Trạng thái',
      field: 'status',
      type: 'status',
      width: '155px',
      options: [
        { label: 'Đang hoạt động', value: 'Đang hoạt động', color: '#52c41a' },
        { label: 'Tạm ngưng', value: 'Tạm ngưng', color: '#faad14' },
      ],
    },
  ];
  shiftTableSettings: SsDtConfig<AdminShift> = {
    rowKey: 'id',
    title: 'Danh sách ca làm việc',
    description: 'Thiết lập khung giờ và ngày áp dụng cho từng ca làm việc',
    cardIcon: 'clock-circle',
    cardStatusLabel: `${this.shifts().length} ca`,
    cardStatusType: 'info',
    primaryButtons: [{ key: 'create-shift', label: 'Thêm mới', type: 'primary', icon: 'plus' }],
    searchable: true,
    searchPlaceholder: 'Tìm theo tên ca hoặc ngày áp dụng',
    showSort: true,
    showFilter: true,
    showSetting: true,
    showPagination: true,
    pageSize: 6,
    pageSizeOptions: [6, 10, 20],
    rowActions: [
      { key: 'detail', label: 'Xem ca làm việc', icon: 'eye' },
      { key: 'edit', label: 'Sửa', icon: 'edit' },
      { key: 'delete', label: 'Xóa', icon: 'delete', danger: true },
    ],
    quickFilters: [
      { key: 'status', placeholder: 'Tất cả trạng thái', options: [
        { label: 'Đang hoạt động', value: 'Đang hoạt động' },
        { label: 'Tạm ngưng', value: 'Tạm ngưng' },
      ] },
    ],
    striped: true,
    size: 'small',
    emptyText: 'Không có ca làm việc phù hợp',
  };

  get activeCount(): number {
    return this.shifts().filter((shift) => shift.status === 'Đang hoạt động').length;
  }

  get assignedCount(): number {
    return this.shifts().reduce((total, shift) => total + shift.assignedCount, 0);
  }

  onPrimaryClick(button: SsDtButton): void {
    if (button.key === 'create-shift') this.openCreateDialog();
  }

  onActionClick(event: SsDtActionClick<AdminShift>): void {
    if (event.action.key === 'detail') {
      this.selectedShift.set(event.row);
      this.detailVisible.set(true);
      return;
    }
    if (event.action.key === 'edit') {
      this.openEditDialog(event.row);
      return;
    }
    if (event.action.key === 'delete') void this.deleteShift(event.row);
  }

  closeDetail(): void {
    this.detailVisible.set(false);
  }

  openCreateDialog(): void {
    Object.assign(this.shiftForm, this.emptyShiftForm());
    this.editingShift.set(null);
    this.formVisible.set(true);
  }

  openEditDialog(shift: AdminShift): void {
    Object.assign(this.shiftForm, {
      shiftName: shift.shiftName,
      startTime: shift.startTime,
      endTime: shift.endTime,
      dayOfWeek: [...shift.dayOfWeek],
      status: shift.status,
    });
    this.editingShift.set(shift);
    this.formVisible.set(true);
  }

  closeFormDialog(): void {
    this.formVisible.set(false);
  }

  toggleDay(day: string): void {
    this.shiftForm.dayOfWeek = this.shiftForm.dayOfWeek.includes(day)
      ? this.shiftForm.dayOfWeek.filter((item) => item !== day)
      : [...this.shiftForm.dayOfWeek, day];
  }

  isDaySelected(day: string): boolean {
    return this.shiftForm.dayOfWeek.includes(day);
  }

  saveShift(formValid: boolean): void {
    if (!formValid) return;
    if (!this.shiftForm.dayOfWeek.length) {
      this.toast.show({ severity: 'warning', summary: 'Chưa chọn ngày áp dụng', detail: 'Vui lòng chọn ít nhất một ngày trong tuần.' });
      return;
    }
    if (this.shiftForm.startTime === this.shiftForm.endTime) {
      this.toast.show({ severity: 'warning', summary: 'Khung giờ không hợp lệ', detail: 'Giờ bắt đầu và giờ kết thúc không được trùng nhau.' });
      return;
    }

    const editingShift = this.editingShift();
    const shift: AdminShift = {
      id: editingShift?.id ?? Date.now(),
      shiftName: this.shiftForm.shiftName.trim(),
      startTime: this.shiftForm.startTime,
      endTime: this.shiftForm.endTime,
      dayOfWeek: [...this.shiftForm.dayOfWeek],
      dayLabel: this.dayLabelOf(this.shiftForm.dayOfWeek),
      assignedCount: editingShift?.assignedCount ?? 0,
      status: this.shiftForm.status,
    };

    this.shifts.update((shifts) => editingShift
      ? shifts.map((item) => item.id === editingShift.id ? shift : item)
      : [...shifts, shift]);
    this.shiftTableSettings = { ...this.shiftTableSettings, cardStatusLabel: `${this.shifts().length} ca` };
    this.closeFormDialog();
    this.toast.show({
      severity: 'success',
      summary: editingShift ? 'Cập nhật ca thành công' : 'Thêm ca thành công',
      detail: `Ca ${shift.shiftName} đã được ${editingShift ? 'cập nhật' : 'thêm vào danh sách'}.`,
    });
  }

  async deleteShift(shift: AdminShift): Promise<void> {
    const confirmed = await this.confirmService.confirm(
      'Xác nhận xóa ca làm việc',
      `Bạn có chắc muốn xóa ca "${shift.shiftName}" không?`,
      { type: 'danger', okText: 'Xóa' },
    );
    if (!confirmed) return;

    this.shifts.update((shifts) => shifts.filter((item) => item.id !== shift.id));
    this.shiftTableSettings = { ...this.shiftTableSettings, cardStatusLabel: `${this.shifts().length} ca` };
    this.toast.show({ severity: 'success', summary: 'Đã xóa ca làm việc', detail: `Ca ${shift.shiftName} đã được xóa khỏi danh sách.` });
  }

  shiftStatusType(status: AdminShift['status']): 'success' | 'warning' {
    return status === 'Tạm ngưng' ? 'warning' : 'success';
  }

  private emptyShiftForm() {
    return {
      shiftName: '',
      startTime: '08:00',
      endTime: '17:00',
      dayOfWeek: ['T2', 'T3', 'T4', 'T5', 'T6'],
      status: 'Đang hoạt động' as AdminShift['status'],
    };
  }

  private dayLabelOf(days: string[]): string {
    if (days.length === 7) return 'Tất cả các ngày';
    if (days.join(',') === 'T2,T3,T4,T5,T6') return 'Thứ Hai - Thứ Sáu';
    if (days.join(',') === 'T2,T3,T4,T5,T6,T7') return 'Thứ Hai - Thứ Bảy';
    if (days.join(',') === 'T7,CN') return 'Thứ Bảy - Chủ Nhật';
    return days.join(' · ');
  }
}
