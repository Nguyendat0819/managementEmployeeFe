import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SsButtonComponent, SsDataTableComponent, SsDatepickerComponent, SsDialogComponent, SsDtActionClick, SsDtButton, SsDtColumn, SsDtConfig, SsSelectComponent, SsStatComponent, SsToastService } from '@platform/ui-kit';
import { AdminEmployeeService } from '../../employees/services/admin-employee.service';
import { EmployeeTask, EmployeeTaskProgress, EmployeeTaskRequest, MonthlyTaskKpi } from '../../../employee/tasks/models/employee-task.model';
import { EmployeeTaskApiService } from '../../../employee/tasks/services/employee-task-api.service';

interface TaskForm {
  employeeCode: string;
  title: string;
  description: string;
  acceptanceCriteria: string;
  periodMonth: string;
  dueDate: string;
  weight: number;
  bonusAmount: number;
  penaltyAmount: number;
}

@Component({
  selector: 'app-task-management',
  standalone: true,
  imports: [CommonModule, FormsModule, SsButtonComponent, SsDataTableComponent, SsDatepickerComponent, SsDialogComponent, SsSelectComponent, SsStatComponent],
  templateUrl: './task-management.component.html',
  styleUrl: './task-management.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskManagementComponent implements OnInit {
  private readonly api = inject(EmployeeTaskApiService);
  private readonly employeesApi = inject(AdminEmployeeService);
  private readonly toast = inject(SsToastService);

  readonly tasks = signal<EmployeeTask[]>([]);
  readonly editingTask = signal<EmployeeTask | null>(null);
  readonly selectedTask = signal<EmployeeTask | null>(null);
  readonly progressHistory = signal<EmployeeTaskProgress[]>([]);
  readonly monthlyKpis = signal<MonthlyTaskKpi[]>([]);
  readonly formVisible = signal(false);
  readonly reviewVisible = signal(false);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly historyLoading = signal(false);
  periodFilter = this.currentMonth();
  reviewReason = '';
  employeeOptions: { label: string; value: string }[] = [];
  employeeLoading = false;
  readonly activeCount = computed(() => this.tasks().filter((task) => task.status === 'TODO' || task.status === 'IN_PROGRESS').length);
  readonly reviewCount = computed(() => this.tasks().filter((task) => task.status === 'SUBMITTED').length);
  readonly reviewBonus = computed(() => this.tasks().filter((task) => task.status === 'SUBMITTED').reduce((sum, task) => sum + task.bonusAmount, 0));
  readonly form: TaskForm = { employeeCode: '', title: '', description: '', acceptanceCriteria: '', periodMonth: this.currentMonth(), dueDate: '', weight: 1, bonusAmount: 0, penaltyAmount: 0 };
  readonly taskColumns: SsDtColumn<EmployeeTask>[] = [
    { key: 'title', header: 'Công việc', field: 'title', width: '220px', sortable: true, filterable: true },
    { key: 'employeeCode', header: 'Mã nhân viên', field: 'employeeCode', width: '135px' },
    { key: 'periodMonth', header: 'Tháng đánh giá', format: (task) => this.formatMonth(task.periodMonth), width: '105px', sortable: true },
    { key: 'dueDate', header: 'Hạn hoàn thành', format: (task) => this.formatDate(task.dueDate), width: '135px', sortable: true },
    { key: 'weight', header: 'Trọng số', format: (task) => `${task.weight}`, width: '90px', align: 'right' },
    { key: 'completion', header: 'Kết quả', format: (task) => task.status === 'APPROVED' ? 'Hoàn thành' : 'Chưa hoàn thành', width: '130px', align: 'center' },
    { key: 'bonusAmount', header: 'Thưởng', format: (task) => this.formatCurrency(task.bonusAmount), width: '125px', align: 'right' },
    { key: 'penaltyAmount', header: 'Phạt nếu không hoàn thành', format: (task) => this.formatCurrency(task.penaltyAmount), width: '170px', align: 'right' },
    { key: 'reviewComment', header: 'Ghi chú duyệt', field: 'reviewComment', width: '200px' },
    { key: 'status', header: 'Trạng thái', field: 'status', type: 'status', width: '135px', options: [
      { label: 'Chưa bắt đầu', value: 'TODO', color: '#8c8c8c' }, { label: 'Đang thực hiện', value: 'IN_PROGRESS', color: '#1677ff' },
      { label: 'Chờ nghiệm thu · chưa hoàn thành', value: 'SUBMITTED', color: '#faad14' }, { label: 'Hoàn thành', value: 'APPROVED', color: '#52c41a' },
      { label: 'Cần làm lại', value: 'REJECTED', color: '#ff4d4f' },
    ] },
  ];
  readonly taskTableSettings: SsDtConfig<EmployeeTask> = {
    rowKey: 'id', title: 'Danh sách công việc', description: 'Theo dõi kết quả hoàn thành và bằng chứng nghiệm thu', cardIcon: 'ordered-list',
    primaryButtons: [{ key: 'create-task', label: 'Thêm mới', type: 'primary', icon: 'plus' }],
    searchable: true, searchPlaceholder: 'Tìm theo tên công việc hoặc mã nhân viên', showSort: true, showSetting: true,
    quickFilters: [{ key: 'employeeCode', placeholder: 'Lọc theo mã nhân viên', options: [], showSearch: true, width: '220px' }],
    showPagination: true, pageSize: 10, pageSizeOptions: [10, 20, 50], striped: true, size: 'small',
    rowActions: [
      { key: 'edit', label: 'Sửa công việc', icon: 'edit', visible: (task) => task.status === 'TODO' },
      { key: 'verify', label: 'Xem bằng chứng', icon: 'file-search', visible: (task) => task.status === 'SUBMITTED' },
      { key: 'history', label: 'Lịch sử', icon: 'history', visible: (task) => task.status !== 'SUBMITTED' },
    ],
    emptyText: 'Chưa có công việc nào được giao',
  };

  ngOnInit(): void {
    this.load();
    this.loadMonthlyKpis();
  }

  createTask(valid: boolean): void {
    if (!valid || this.saving()) return;
    const request: EmployeeTaskRequest = {
      employeeCode: this.form.employeeCode.trim(),
      title: this.form.title.trim(),
      description: this.form.description.trim(),
      acceptanceCriteria: this.form.acceptanceCriteria.trim(),
      periodMonth: `${this.form.periodMonth}-01`,
      dueDate: this.form.dueDate || null,
      weight: Number(this.form.weight),
      bonusAmount: Number(this.form.bonusAmount),
      penaltyAmount: Number(this.form.penaltyAmount),
    };
    this.saving.set(true);
    const editing = this.editingTask();
    const saveRequest = editing ? this.api.update(editing.id, request) : this.api.create(request);
    saveRequest.subscribe({
      next: (task) => {
        this.tasks.update((tasks) => editing
          ? tasks.map((item) => item.id === task.id ? task : item)
          : [task, ...tasks]);
        this.cancelEdit();
        this.toast.show({ severity: 'success', summary: editing ? 'Đã cập nhật công việc' : 'Đã giao công việc', detail: `Công việc của ${task.employeeCode} đã được lưu.` });
      },
      error: () => this.saving.set(false),
      complete: () => this.saving.set(false),
    });
  }

  openReview(task: EmployeeTask): void {
    this.selectedTask.set(task);
    this.reviewReason = '';
    this.progressHistory.set([]);
    this.reviewVisible.set(true);
    this.historyLoading.set(true);
    this.api.getHistory(task.id).subscribe({
      next: (history) => this.progressHistory.set(history),
      error: () => this.toast.show({ severity: 'error', summary: 'Không tải được lịch sử', detail: 'Vui lòng mở lại công việc sau.' }),
      complete: () => this.historyLoading.set(false),
    });
  }

  closeReview(): void {
    this.reviewVisible.set(false);
    this.selectedTask.set(null);
    this.reviewReason = '';
  }

  edit(task: EmployeeTask): void {
    this.formVisible.set(true);
    this.editingTask.set(task);
    Object.assign(this.form, {
      employeeCode: task.employeeCode,
      title: task.title,
      description: task.description ?? '',
      acceptanceCriteria: task.acceptanceCriteria,
      periodMonth: task.periodMonth.slice(0, 7),
      dueDate: task.dueDate ?? '',
      weight: task.weight,
      bonusAmount: task.bonusAmount,
      penaltyAmount: task.penaltyAmount,
    });
  }

  cancelEdit(): void {
    this.editingTask.set(null);
    this.formVisible.set(false);
    Object.assign(this.form, { employeeCode: '', title: '', description: '', acceptanceCriteria: '', periodMonth: this.currentMonth(), dueDate: '', weight: 1, bonusAmount: 0, penaltyAmount: 0 });
  }

  onFormVisibilityChange(visible: boolean): void {
    if (!visible) this.cancelEdit();
  }

  onPrimaryClick(button: SsDtButton): void {
    if (button.key !== 'create-task') return;
    this.editingTask.set(null);
    Object.assign(this.form, { employeeCode: '', title: '', description: '', acceptanceCriteria: '', periodMonth: this.currentMonth(), dueDate: '', weight: 1, bonusAmount: 0, penaltyAmount: 0 });
    this.formVisible.set(true);
  }

  onActionClick(event: SsDtActionClick<EmployeeTask>): void {
    if (event.action.key === 'edit') this.edit(event.row);
    if (event.action.key === 'verify' || event.action.key === 'history') this.openReview(event.row);
  }

  approveSelected(): void {
    const task = this.selectedTask();
    if (task && this.canApprove(task)) this.review(task, true, '');
  }

  requestSupplement(): void {
    const task = this.selectedTask();
    const reason = this.reviewReason.trim();
    if (!task || !reason) return;
    this.review(task, false, reason);
  }

  formatCurrency(value: number): string {
    return `${new Intl.NumberFormat('vi-VN').format(value)} ₫`;
  }

  formatDate(value: string | null): string {
    if (!value) return '—';
    const [year, month, day] = value.slice(0, 10).split('-');
    return `${day}/${month}/${year}`;
  }

  formatMonth(value: string): string {
    const [year, month] = value.slice(0, 7).split('-');
    return `${month}/${year}`;
  }

  formatSubmissionStatus(status: EmployeeTaskProgress['status']): string {
    return status === 'PENDING' ? 'Chờ nghiệm thu' : status === 'APPROVED' ? 'Đã nghiệm thu' : 'Cần bổ sung';
  }

  isImageEvidence(value: string): boolean {
    return /\.(png|jpe?g|gif|webp|bmp)(?:\?.*)?$/i.test(value);
  }

  displayEvidenceName(value: string): string {
    try {
      return decodeURIComponent(new URL(value).pathname.split('/').pop() || value);
    } catch {
      return value;
    }
  }

  canApprove(task: EmployeeTask): boolean {
    return task.latestProgress !== null && task.latestProgress.evidenceLinks.length > 0;
  }

  loadMonthlyKpis(): void {
    if (!this.periodFilter) return;
    this.api.getMonthlyKpis(this.periodFilter).subscribe({ next: (rows) => this.monthlyKpis.set(rows) });
  }

  private review(task: EmployeeTask, approved: boolean, comment: string): void {
    const request = approved ? this.api.approve(task.id, comment) : this.api.reject(task.id, comment);
    request.subscribe({
      next: (updated) => {
        this.tasks.update((tasks) => tasks.map((item) => item.id === updated.id ? updated : item));
        this.closeReview();
        this.loadMonthlyKpis();
        const reviewDetail = approved
          ? `Công việc đã hoàn thành và sẽ được tính vào chỉ số tháng ${this.formatMonth(updated.periodMonth)}.`
          : 'Nhân viên sẽ nhận lý do và có thể bổ sung kết quả, bằng chứng.';
        this.toast.show({ severity: approved ? 'success' : 'info', summary: approved ? 'Đã nghiệm thu công việc' : 'Đã yêu cầu bổ sung', detail: reviewDetail });
      },
    });
  }

  private load(): void {
    this.api.getAll().subscribe({
      next: (tasks) => this.tasks.set(tasks),
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
    this.employeeLoading = true;
    this.employeesApi.getEmployees().subscribe({
      next: ({ data }) => {
        const employees = data.filter((employee) => !employee.isDeleted && employee.status !== 'Tạm nghỉ');
        this.employeeOptions = employees.map((employee) => ({ label: `${employee.employeeCode} - ${employee.fullName}`, value: employee.employeeCode }));
        this.employeeLoading = false;
      },
      error: () => this.employeeLoading = false,
    });
  }

  private currentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  get taskTableConfig(): SsDtConfig<EmployeeTask> {
    return {
      ...this.taskTableSettings,
      loading: this.loading(),
      quickFilters: [{ key: 'employeeCode', placeholder: 'Lọc theo mã nhân viên', options: this.taskEmployeeFilterOptions, showSearch: true, width: '220px' }],
    };
  }

  private get taskEmployeeFilterOptions(): { label: string; value: string }[] {
    const employeeNames = new Map(this.employeeOptions.map((option) => [option.value, option.label]));
    return [...new Set(this.tasks().map((task) => task.employeeCode))]
      .map((employeeCode) => ({ label: employeeNames.get(employeeCode) ?? employeeCode, value: employeeCode }));
  }
}
