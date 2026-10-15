import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SsButtonComponent, SsConfirmService, SsDataTableComponent, SsDatepickerComponent, SsDialogComponent, SsDtActionClick, SsDtButton, SsDtColumn, SsDtConfig, SsStatComponent, SsTagComponent, SsToastService } from '@platform/ui-kit';
import { AdminShiftAssignment } from '../../models/admin-shift-assignment.model';
import { AdminShiftRosterService } from '../../services/admin-shift-roster.service';
import { AdminShiftService } from '../../../shifts/services/admin-shift.service';

interface ShiftOption {
  id: number;
  name: string;
  time: string;
}

@Component({
  selector: 'app-admin-shift-assignment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SsButtonComponent, SsDataTableComponent, SsDatepickerComponent, SsDialogComponent, SsStatComponent, SsTagComponent],
  templateUrl: './admin-shift-assignment-list.component.html',
  styleUrl: './admin-shift-assignment-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminShiftAssignmentListComponent implements OnInit {
  private readonly rosterService = inject(AdminShiftRosterService);
  private readonly shiftService = inject(AdminShiftService);
  private readonly toast = inject(SsToastService);
  private readonly confirmService = inject(SsConfirmService);

  readonly assignments = signal<AdminShiftAssignment[]>([]);
  readonly selectedAssignment = signal<AdminShiftAssignment | null>(null);
  readonly detailVisible = signal(false);
  readonly formVisible = signal(false);
  readonly editingAssignment = signal<AdminShiftAssignment | null>(null);
  readonly assignmentForm = this.emptyAssignmentForm();
  readonly shiftOptions = signal<ShiftOption[]>([]);
  readonly assignmentColumns: SsDtColumn<AdminShiftAssignment>[] = [
    { key: 'employeeCode', header: 'Mã nhân viên', field: 'employeeCode', width: '165px', sortable: true, filterable: true },
    { key: 'shiftName', header: 'Ca làm việc', field: 'shiftName', width: '165px', filterable: true },
    { key: 'shiftTime', header: 'Khung giờ', field: 'shiftTime', width: '145px' },
    { key: 'effectiveDate', header: 'Ngày bắt đầu', field: 'effectiveDate', width: '125px', sortable: true },
    { key: 'endDate', header: 'Ngày kết thúc', field: 'endDate', width: '125px', sortable: true },
    {
      key: 'status',
      header: 'Trạng thái',
      field: 'status',
      type: 'status',
      width: '145px',
      options: [
        { label: 'Đang áp dụng', value: 'Đang áp dụng', color: '#52c41a' },
        { label: 'Sắp áp dụng', value: 'Sắp áp dụng', color: '#1677ff' },
        { label: 'Đã kết thúc', value: 'Đã kết thúc', color: '#8c8c8c' },
      ],
    },
  ];
  rosterTableSettings: SsDtConfig<AdminShiftAssignment> = {
    rowKey: 'id',
    title: 'Danh sách phân ca làm việc',
    description: 'Theo dõi ca làm việc được phân công theo từng nhân sự và thời hạn áp dụng',
    cardIcon: 'schedule',
    cardStatusLabel: `${this.assignments().length} phân ca`,
    cardStatusType: 'info',
    primaryButtons: [{ key: 'create-assignment', label: 'Thêm mới', type: 'primary', icon: 'plus' }],
    searchable: true,
    searchPlaceholder: 'Tìm theo mã nhân viên hoặc ca làm việc',
    showSort: true,
    showFilter: true,
    showSetting: true,
    showPagination: true,
    pageSize: 6,
    pageSizeOptions: [6, 10, 20],
    rowActions: [
      { key: 'detail', label: 'Xem phân ca', icon: 'eye' },
      { key: 'edit', label: 'Sửa', icon: 'edit' },
      { key: 'delete', label: 'Xóa', icon: 'delete', danger: true },
    ],
    quickFilters: [
      { key: 'status', placeholder: 'Tất cả trạng thái', options: [
        { label: 'Đang áp dụng', value: 'Đang áp dụng' },
        { label: 'Sắp áp dụng', value: 'Sắp áp dụng' },
        { label: 'Đã kết thúc', value: 'Đã kết thúc' },
      ] },
    ],
    striped: true,
    size: 'small',
    emptyText: 'Không có phân ca phù hợp',
  };

  ngOnInit(): void {
    this.refreshAssignments();
    this.shiftService.getShifts().subscribe({
      next: (shifts) => this.shiftOptions.set(shifts
        .filter((shift) => shift.status === 'Đang hoạt động')
        .map((shift) => ({ id: shift.id, name: shift.shiftName, time: `${shift.startTime} - ${shift.endTime}` }))),
    });
  }

  get activeCount(): number {
    return this.assignments().filter((assignment) => assignment.status === 'Đang áp dụng').length;
  }

  get uniqueEmployeeCount(): number {
    return new Set(this.assignments().map((assignment) => assignment.employeeCode)).size;
  }

  get expiringCount(): number {
    return this.assignments().filter((assignment) => assignment.status === 'Sắp áp dụng').length;
  }

  onPrimaryClick(button: SsDtButton): void {
    if (button.key === 'create-assignment') this.openCreateDialog();
  }

  onActionClick(event: SsDtActionClick<AdminShiftAssignment>): void {
    if (event.action.key === 'detail') {
      this.selectedAssignment.set(event.row);
      this.detailVisible.set(true);
      return;
    }
    if (event.action.key === 'edit') {
      this.openEditDialog(event.row);
      return;
    }
    if (event.action.key === 'delete') void this.deleteAssignment(event.row);
  }

  closeDetail(): void {
    this.detailVisible.set(false);
  }

  openCreateDialog(): void {
    Object.assign(this.assignmentForm, this.emptyAssignmentForm());
    this.editingAssignment.set(null);
    this.formVisible.set(true);
  }

  openEditDialog(assignment: AdminShiftAssignment): void {
    Object.assign(this.assignmentForm, {
      employeeCode: assignment.employeeCode,
      shiftId: assignment.shiftId,
      effectiveDate: this.toInputDate(assignment.effectiveDate),
      endDate: this.toInputDate(assignment.endDate),
    });
    this.editingAssignment.set(assignment);
    this.formVisible.set(true);
  }

  closeFormDialog(): void {
    this.formVisible.set(false);
  }

  saveAssignment(formValid: boolean): void {
    if (!formValid) return;
    if (this.assignmentForm.endDate && this.assignmentForm.endDate < this.assignmentForm.effectiveDate) {
      this.toast.show({ severity: 'warning', summary: 'Thời hạn không hợp lệ', detail: 'Ngày kết thúc phải sau ngày bắt đầu.' });
      return;
    }

    const selectedShift = this.shiftOptions().find((shift) => shift.id === Number(this.assignmentForm.shiftId));
    if (!selectedShift) {
      this.toast.show({ severity: 'warning', summary: 'Chưa có ca hoạt động', detail: 'Hãy tạo và kích hoạt ca làm việc trước khi phân ca cho nhân viên.' });
      return;
    }
    const editingAssignment = this.editingAssignment();
    this.rosterService.saveAssignment(editingAssignment?.id, {
      employeeCode: this.assignmentForm.employeeCode.trim(),
      shiftId: selectedShift.id,
      effectiveDate: this.assignmentForm.effectiveDate,
      endDate: this.assignmentForm.endDate || null,
    }).subscribe({
      next: (assignment) => {
        this.refreshAssignments();
        this.closeFormDialog();
        this.toast.show({
          severity: 'success',
          summary: editingAssignment ? 'Cập nhật phân ca thành công' : 'Thêm phân ca thành công',
          detail: `Mã nhân viên ${assignment.employeeCode} đã được ${editingAssignment ? 'cập nhật' : 'phân ca'}.`,
        });
      },
    });
  }

  async deleteAssignment(assignment: AdminShiftAssignment): Promise<void> {
    const confirmed = await this.confirmService.confirm(
      'Xác nhận xóa phân ca',
      `Bạn có chắc muốn xóa phân ca của mã nhân viên ${assignment.employeeCode} không?`,
      { type: 'danger', okText: 'Xóa' },
    );
    if (!confirmed) return;

    this.rosterService.deleteAssignment(assignment.id).subscribe({
      next: () => {
        this.refreshAssignments();
        this.toast.show({ severity: 'success', summary: 'Đã xóa phân ca', detail: `Phân ca của ${assignment.employeeCode} đã được xóa.` });
      },
    });
  }

  assignmentStatusType(status: AdminShiftAssignment['status']): 'success' | 'info' | 'default' {
    if (status === 'Sắp áp dụng') return 'info';
    if (status === 'Đã kết thúc') return 'default';
    return 'success';
  }

  private emptyAssignmentForm() {
    return {
      employeeCode: '',
      shiftId: null as number | null,
      effectiveDate: '',
      endDate: '',
    };
  }

  private toInputDate(value: string): string {
    if (!value || value === 'Không xác định thời hạn') return '';
    const [day, month, year] = value.split('/');
    return year ? `${year}-${month}-${day}` : value;
  }

  private refreshAssignments(): void {
    this.rosterService.getAssignments().subscribe({
      next: (assignments) => {
        this.assignments.set(assignments);
        this.rosterTableSettings = { ...this.rosterTableSettings, cardStatusLabel: `${assignments.length} phân ca` };
      },
    });
  }
}
