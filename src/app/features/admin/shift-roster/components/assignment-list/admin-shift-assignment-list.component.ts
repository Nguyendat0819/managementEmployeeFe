import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SsButtonComponent, SsConfirmService, SsDataTableComponent, SsDialogComponent, SsDtActionClick, SsDtButton, SsDtColumn, SsDtConfig, SsStatComponent, SsTagComponent, SsToastService } from '@platform/ui-kit';
import { AdminShiftAssignment } from '../../models/admin-shift-assignment.model';
import { AdminShiftRosterService } from '../../services/admin-shift-roster.service';

interface ShiftOption {
  id: number;
  name: string;
  time: string;
}

@Component({
  selector: 'app-admin-shift-assignment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SsButtonComponent, SsDataTableComponent, SsDialogComponent, SsStatComponent, SsTagComponent],
  templateUrl: './admin-shift-assignment-list.component.html',
  styleUrl: './admin-shift-assignment-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminShiftAssignmentListComponent {
  private readonly rosterService = inject(AdminShiftRosterService);
  private readonly toast = inject(SsToastService);
  private readonly confirmService = inject(SsConfirmService);

  readonly assignments = signal(this.rosterService.assignments);
  readonly selectedAssignment = signal<AdminShiftAssignment | null>(null);
  readonly detailVisible = signal(false);
  readonly formVisible = signal(false);
  readonly editingAssignment = signal<AdminShiftAssignment | null>(null);
  readonly assignmentForm = this.emptyAssignmentForm();
  readonly shiftOptions: ShiftOption[] = [
    { id: 1, name: 'Ca hành chính', time: '08:00 - 17:00' },
    { id: 2, name: 'Ca sáng', time: '06:00 - 14:00' },
    { id: 3, name: 'Ca chiều', time: '14:00 - 22:00' },
    { id: 4, name: 'Ca đêm', time: '22:00 - 06:00' },
  ];
  readonly assignmentColumns: SsDtColumn<AdminShiftAssignment>[] = [
    { key: 'employeeCode', header: 'Mã nhân viên', field: 'employeeCode', width: '135px', sortable: true, filterable: true },
    { key: 'employeeName', header: 'Nhân viên', field: 'employeeName', width: '190px', sortable: true, filterable: true },
    { key: 'department', header: 'Phòng ban', field: 'department', width: '200px', filterable: true },
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
    searchPlaceholder: 'Tìm theo mã, tên nhân viên, phòng ban hoặc ca làm việc',
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
      { key: 'shiftName', placeholder: 'Tất cả ca làm việc', options: [
        { label: 'Ca hành chính', value: 'Ca hành chính' },
        { label: 'Ca sáng', value: 'Ca sáng' },
        { label: 'Ca chiều', value: 'Ca chiều' },
        { label: 'Ca đêm', value: 'Ca đêm' },
      ] },
    ],
    striped: true,
    size: 'small',
    emptyText: 'Không có phân ca phù hợp',
  };

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
      employeeName: assignment.employeeName,
      department: assignment.department,
      shiftId: assignment.shiftId,
      effectiveDate: this.toInputDate(assignment.effectiveDate),
      endDate: this.toInputDate(assignment.endDate),
      status: assignment.status,
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

    const selectedShift = this.shiftOptions.find((shift) => shift.id === Number(this.assignmentForm.shiftId));
    if (!selectedShift) return;
    const editingAssignment = this.editingAssignment();
    const assignment: AdminShiftAssignment = {
      id: editingAssignment?.id ?? Date.now(),
      employeeCode: this.assignmentForm.employeeCode.trim(),
      employeeName: this.assignmentForm.employeeName.trim(),
      department: this.assignmentForm.department.trim(),
      shiftId: selectedShift.id,
      shiftName: selectedShift.name,
      shiftTime: selectedShift.time,
      effectiveDate: this.formatDate(this.assignmentForm.effectiveDate),
      endDate: this.assignmentForm.endDate ? this.formatDate(this.assignmentForm.endDate) : 'Không xác định thời hạn',
      status: this.assignmentForm.status,
    };

    this.assignments.update((assignments) => editingAssignment
      ? assignments.map((item) => item.id === editingAssignment.id ? assignment : item)
      : [...assignments, assignment]);
    this.rosterTableSettings = { ...this.rosterTableSettings, cardStatusLabel: `${this.assignments().length} phân ca` };
    this.closeFormDialog();
    this.toast.show({
      severity: 'success',
      summary: editingAssignment ? 'Cập nhật phân ca thành công' : 'Thêm phân ca thành công',
      detail: `Phân ca cho ${assignment.employeeName} đã được ${editingAssignment ? 'cập nhật' : 'thêm vào danh sách'}.`,
    });
  }

  async deleteAssignment(assignment: AdminShiftAssignment): Promise<void> {
    const confirmed = await this.confirmService.confirm(
      'Xác nhận xóa phân ca',
      `Bạn có chắc muốn xóa phân ca của "${assignment.employeeName}" không?`,
      { type: 'danger', okText: 'Xóa' },
    );
    if (!confirmed) return;

    this.assignments.update((assignments) => assignments.filter((item) => item.id !== assignment.id));
    this.rosterTableSettings = { ...this.rosterTableSettings, cardStatusLabel: `${this.assignments().length} phân ca` };
    this.toast.show({ severity: 'success', summary: 'Đã xóa phân ca', detail: `Phân ca của ${assignment.employeeName} đã được xóa.` });
  }

  assignmentStatusType(status: AdminShiftAssignment['status']): 'success' | 'info' | 'default' {
    if (status === 'Sắp áp dụng') return 'info';
    if (status === 'Đã kết thúc') return 'default';
    return 'success';
  }

  private emptyAssignmentForm() {
    return {
      employeeCode: '',
      employeeName: '',
      department: '',
      shiftId: 1,
      effectiveDate: '',
      endDate: '',
      status: 'Đang áp dụng' as AdminShiftAssignment['status'],
    };
  }

  private toInputDate(value: string): string {
    if (!value || value === 'Không xác định thời hạn') return '';
    const [day, month, year] = value.split('/');
    return year ? `${year}-${month}-${day}` : value;
  }

  private formatDate(value: string): string {
    const [year, month, day] = value.split('-');
    return day && month && year ? `${day}/${month}/${year}` : value;
  }
}
