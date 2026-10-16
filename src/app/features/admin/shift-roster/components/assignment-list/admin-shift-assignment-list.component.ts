import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { concatMap, finalize, from, map, toArray } from 'rxjs';
import { SsButtonComponent, SsConfirmService, SsDataTableComponent, SsDatepickerComponent, SsDialogComponent, SsDtActionClick, SsDtButton, SsDtColumn, SsDtConfig, SsStatComponent, SsTagComponent, SsToastService, SsTransferComponent, SsTransferItem } from '@platform/ui-kit';
import { AdminShiftAssignment } from '../../models/admin-shift-assignment.model';
import { AdminShiftRosterService } from '../../services/admin-shift-roster.service';
import { AdminShiftService } from '../../../shifts/services/admin-shift.service';
import { AdminEmployeeService } from '../../../employees/services/admin-employee.service';

interface ShiftOption {
  id: number;
  name: string;
  time: string;
}

@Component({
  selector: 'app-admin-shift-assignment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SsButtonComponent, SsDataTableComponent, SsDatepickerComponent, SsDialogComponent, SsStatComponent, SsTagComponent, SsTransferComponent],
  templateUrl: './admin-shift-assignment-list.component.html',
  styleUrl: './admin-shift-assignment-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminShiftAssignmentListComponent implements OnInit {
  private readonly rosterService = inject(AdminShiftRosterService);
  private readonly shiftService = inject(AdminShiftService);
  private readonly employeeService = inject(AdminEmployeeService);
  private readonly toast = inject(SsToastService);
  private readonly confirmService = inject(SsConfirmService);

  readonly assignments = signal<AdminShiftAssignment[]>([]);
  readonly assignmentsLoaded = signal(false);
  readonly selectedAssignment = signal<AdminShiftAssignment | null>(null);
  readonly detailVisible = signal(false);
  readonly formVisible = signal(false);
  readonly editingAssignment = signal<AdminShiftAssignment | null>(null);
  readonly selectedEmployees = signal<SsTransferItem[]>([]);
  readonly employeeSearchResults = signal<SsTransferItem[]>([]);
  readonly employeeSearching = signal(false);
  readonly employeeHasMore = signal(false);
  readonly employeeTotalFound = signal<number | null>(null);
  readonly savingAssignment = signal(false);
  readonly assignmentForm = this.emptyAssignmentForm();
  readonly shiftOptions = signal<ShiftOption[]>([]);
  private employeeSearchTerm = '';
  private employeeSearchPage = 0;
  private employeeSearchRequestId = 0;
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
    this.resetEmployeeSearch();
    this.selectedEmployees.set([]);
    this.editingAssignment.set(null);
    this.formVisible.set(true);
    this.refreshAssignments();
  }

  openEditDialog(assignment: AdminShiftAssignment): void {
    this.resetEmployeeSearch();
    Object.assign(this.assignmentForm, {
      shiftId: assignment.shiftId,
      effectiveDate: this.toInputDate(assignment.effectiveDate),
      endDate: this.toInputDate(assignment.endDate),
    });
    this.selectedEmployees.set([{ value: assignment.employeeCode, label: assignment.employeeCode }]);
    this.editingAssignment.set(assignment);
    this.formVisible.set(true);
  }

  closeFormDialog(): void {
    this.onFormVisibilityChange(false);
  }

  onFormVisibilityChange(visible: boolean): void {
    if (!visible) this.resetEmployeeSearch();
    this.formVisible.set(visible);
  }

  saveAssignment(formValid: boolean): void {
    if (!formValid) return;
    const employees = this.selectedEmployees();
    if (!employees.length) {
      this.toast.show({ severity: 'warning', summary: 'Chưa chọn nhân viên', detail: 'Chọn ít nhất một nhân viên để phân ca.' });
      return;
    }
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
    const assignmentRequest = (employeeCode: string) => ({
      employeeCode,
      shiftId: selectedShift.id,
      effectiveDate: this.assignmentForm.effectiveDate,
      endDate: this.assignmentForm.endDate || null,
    });
    let savedCount = 0;
    const savedEmployeeCodes: string[] = [];
    this.savingAssignment.set(true);
    from(employees).pipe(
      concatMap((employee) => this.rosterService.saveAssignment(
        editingAssignment?.id,
        assignmentRequest(employee.value.trim()),
      ).pipe(map((assignment) => {
        savedCount++;
        savedEmployeeCodes.push(assignment.employeeCode);
        return assignment;
      }))),
      toArray(),
      finalize(() => this.savingAssignment.set(false)),
    ).subscribe({
      next: (savedAssignments) => {
        this.refreshAssignments();
        this.closeFormDialog();
        this.toast.show({
          severity: 'success',
          summary: editingAssignment ? 'Cập nhật phân ca thành công' : 'Thêm phân ca thành công',
          detail: editingAssignment
            ? `Mã nhân viên ${savedAssignments[0].employeeCode} đã được cập nhật.`
            : `Đã phân ca cho ${savedAssignments.length} nhân viên.`,
        });
      },
      error: () => {
        if (savedCount) {
          this.selectedEmployees.set(this.selectedEmployees().filter((employee) => !savedEmployeeCodes.includes(employee.value)));
          this.refreshAssignments();
        }
        this.toast.show({
          severity: 'error',
          summary: 'Phân ca chưa hoàn tất',
          detail: savedCount
            ? `Đã lưu ${savedCount}/${employees.length} nhân viên trước khi gặp lỗi. Hãy kiểm tra danh sách phân ca.`
            : 'Không thể lưu phân ca. Vui lòng kiểm tra dữ liệu và thử lại.',
        });
      },
    });
  }

  searchEmployees(keyword: string): void {
    if (!this.canLoadEmployees()) return;
    this.employeeSearchTerm = keyword.trim();
    this.employeeSearchPage = 0;
    this.employeeSearchResults.set([]);
    this.employeeTotalFound.set(null);
    this.fetchEmployees(false);
  }

  onAssignmentCriteriaChanged(): void {
    if (this.editingAssignment()) return;
    this.selectedEmployees.set([]);
    this.employeeSearchResults.set([]);
    this.employeeSearchPage = 0;
    this.employeeSearchRequestId++;
    this.employeeSearching.set(false);
    this.employeeHasMore.set(false);
    this.employeeTotalFound.set(null);
    if (this.canLoadEmployees()) {
      this.fetchEmployees(false);
    } else {
      this.employeeSearchTerm = '';
    }
  }

  loadMoreEmployees(): void {
    if (this.employeeSearching() || !this.employeeHasMore()) return;
    this.employeeSearchPage++;
    this.fetchEmployees(true);
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
      shiftId: null as number | null,
      effectiveDate: this.toApiDate(new Date()),
      endDate: '',
    };
  }

  private resetEmployeeSearch(): void {
    this.employeeSearchRequestId++;
    this.employeeSearchTerm = '';
    this.employeeSearchPage = 0;
    this.employeeSearching.set(false);
    this.employeeHasMore.set(false);
    this.employeeTotalFound.set(null);
    this.employeeSearchResults.set([]);
  }

  private toApiDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private fetchEmployees(append: boolean): void {
    const requestId = ++this.employeeSearchRequestId;
    this.employeeSearching.set(true);
    this.employeeService.searchEmployees({ page: this.employeeSearchPage, size: 20, search: this.employeeSearchTerm || undefined })
      .pipe(finalize(() => {
        if (requestId === this.employeeSearchRequestId) this.employeeSearching.set(false);
      }))
      .subscribe({
        next: (response) => {
          if (requestId !== this.employeeSearchRequestId) return;
          const page = response.data;
          const results = (page?.content ?? [])
            .map((employee) => this.toAssignmentCandidate({
              employeeCode: employee.employeeCode,
              fullName: employee.fullName,
              departmentName: employee.departmentName,
              positionName: employee.positionName,
            }))
            .filter((employee): employee is SsTransferItem => employee !== null);
          this.employeeSearchResults.set(append ? [...this.employeeSearchResults(), ...results] : results);
          this.employeeTotalFound.set(null);
          this.employeeHasMore.set((page?.page ?? 0) + 1 < (page?.totalPages ?? 0));
        },
        error: () => {
          if (requestId !== this.employeeSearchRequestId) return;
          this.employeeHasMore.set(false);
          this.toast.show({ severity: 'error', summary: 'Không tải được nhân viên', detail: 'Vui lòng thử tìm lại sau.' });
        },
      });
  }

  canLoadEmployees(): boolean {
    return !this.editingAssignment()
      && this.assignmentsLoaded()
      && this.assignmentForm.shiftId !== null
      && !!this.assignmentForm.effectiveDate
      && (!this.assignmentForm.endDate || this.assignmentForm.endDate >= this.assignmentForm.effectiveDate);
  }

  private toAssignmentCandidate(employee: {
    employeeCode: string;
    fullName: string;
    departmentName: string | null;
    positionName: string | null;
  }): SsTransferItem | null {
    const existingAssignments = this.assignments().filter((assignment) =>
      assignment.employeeCode === employee.employeeCode
      && this.assignmentPeriodsOverlap(assignment),
    );
    if (existingAssignments.some((assignment) => assignment.shiftId !== Number(this.assignmentForm.shiftId))) {
      return null;
    }

    const alreadyOnShift = existingAssignments.find((assignment) => assignment.shiftId === Number(this.assignmentForm.shiftId));
    return {
      value: employee.employeeCode,
      label: `${employee.employeeCode} · ${employee.fullName}`,
      description: alreadyOnShift
        ? `Đã phân ca ${alreadyOnShift.shiftName}`
        : [employee.departmentName, employee.positionName].filter(Boolean).join(' · '),
      disabled: !!alreadyOnShift,
    };
  }

  private assignmentPeriodsOverlap(assignment: AdminShiftAssignment): boolean {
    const assignedStart = this.toInputDate(assignment.effectiveDate);
    const assignedEnd = assignment.endDate === 'Không xác định thời hạn'
      ? '9999-12-31'
      : this.toInputDate(assignment.endDate);
    const requestedEnd = this.assignmentForm.endDate || '9999-12-31';
    return assignedStart <= requestedEnd && assignedEnd >= this.assignmentForm.effectiveDate;
  }

  private toInputDate(value: string): string {
    if (!value || value === 'Không xác định thời hạn') return '';
    const [day, month, year] = value.split('/');
    return year ? `${year}-${month}-${day}` : value;
  }

  private refreshAssignments(): void {
    this.assignmentsLoaded.set(false);
    this.rosterService.getAssignments().subscribe({
      next: (assignments) => {
        this.assignments.set(assignments);
        this.assignmentsLoaded.set(true);
        this.rosterTableSettings = { ...this.rosterTableSettings, cardStatusLabel: `${assignments.length} phân ca` };
        if (this.canLoadEmployees()) this.fetchEmployees(false);
      },
      error: () => {
        this.assignmentsLoaded.set(false);
        this.toast.show({ severity: 'error', summary: 'Không tải được danh sách phân ca', detail: 'Không thể kiểm tra ca hiện tại của nhân viên.' });
      },
    });
  }
}
