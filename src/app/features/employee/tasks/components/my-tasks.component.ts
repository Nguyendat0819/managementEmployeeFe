import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SsButtonComponent, SsDataTableComponent, SsDatepickerComponent, SsDialogComponent, SsDtActionClick, SsDtColumn, SsDtConfig, SsStatComponent, SsToastService } from '@platform/ui-kit';
import { EmployeeTask, EmployeeTaskProgress, MonthlyTaskKpi } from '../models/employee-task.model';
import { EmployeeTaskApiService } from '../services/employee-task-api.service';

@Component({
  selector: 'app-my-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, SsButtonComponent, SsDataTableComponent, SsDatepickerComponent, SsDialogComponent, SsStatComponent],
  templateUrl: './my-tasks.component.html',
  styleUrl: './my-tasks.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyTasksComponent implements OnInit {
  private readonly api = inject(EmployeeTaskApiService);
  private readonly toast = inject(SsToastService);

  readonly tasks = signal<EmployeeTask[]>([]);
  readonly loading = signal(true);
  readonly busyTaskId = signal<number | null>(null);
  readonly selectedTask = signal<EmployeeTask | null>(null);
  readonly progressHistory = signal<EmployeeTaskProgress[]>([]);
  readonly monthlyKpi = signal<MonthlyTaskKpi | null>(null);
  readonly progressVisible = signal(false);
  readonly historyVisible = signal(false);
  readonly historyLoading = signal(false);
  readonly openCount = computed(() => this.tasks().filter((task) => task.status === 'TODO' || task.status === 'IN_PROGRESS').length);
  readonly submittedCount = computed(() => this.tasks().filter((task) => task.status === 'SUBMITTED').length);
  readonly approvedBonus = computed(() => this.tasks().filter((task) => task.status === 'APPROVED').reduce((sum, task) => sum + task.bonusAmount, 0));
  readonly taskColumns: SsDtColumn<EmployeeTask>[] = [
    { key: 'title', header: 'Công việc', field: 'title', width: '220px', sortable: true, filterable: true },
    { key: 'description', header: 'Mô tả', field: 'description', width: '220px' },
    { key: 'acceptanceCriteria', header: 'Tiêu chí nghiệm thu', field: 'acceptanceCriteria', width: '260px' },
    { key: 'periodMonth', header: 'Tháng đánh giá', format: (task) => this.formatMonth(task.periodMonth), width: '100px', sortable: true },
    { key: 'dueDate', header: 'Hạn hoàn thành', format: (task) => this.formatDate(task.dueDate), width: '135px', sortable: true },
    { key: 'weight', header: 'Trọng số', field: 'weight', width: '90px', align: 'right' },
    { key: 'completion', header: 'Kết quả', format: (task) => task.status === 'APPROVED' ? 'Hoàn thành' : 'Chưa hoàn thành', width: '135px', align: 'center' },
    { key: 'bonusAmount', header: 'Thưởng', format: (task) => this.formatCurrency(task.bonusAmount), width: '125px', align: 'right' },
    { key: 'reviewComment', header: 'Phản hồi quản lý', field: 'reviewComment', width: '220px' },
    { key: 'status', header: 'Trạng thái', field: 'status', type: 'status', width: '135px', options: [
      { label: 'Chưa bắt đầu', value: 'TODO', color: '#8c8c8c' }, { label: 'Đang thực hiện', value: 'IN_PROGRESS', color: '#1677ff' },
      { label: 'Chờ xác minh · chưa hoàn thành', value: 'SUBMITTED', color: '#faad14' }, { label: 'Hoàn thành', value: 'APPROVED', color: '#52c41a' },
      { label: 'Cần bổ sung', value: 'REJECTED', color: '#ff4d4f' },
    ] },
  ];
  readonly taskTableSettings: SsDtConfig<EmployeeTask> = {
    rowKey: 'id', title: 'Danh sách công việc của tôi', description: 'Gửi kết quả và minh chứng để quản lý nghiệm thu', cardIcon: 'ordered-list',
    searchable: true, searchPlaceholder: 'Tìm theo tên công việc', showSort: true, showSetting: true,
    showPagination: true, pageSize: 10, pageSizeOptions: [10, 20, 50, 100], striped: true, size: 'small',
    rowActions: [
      { key: 'start', label: 'Bắt đầu / làm lại', icon: 'play-circle', visible: (task) => task.status === 'TODO' || task.status === 'REJECTED', disabled: (task) => this.busyTaskId() === task.id },
      { key: 'submit', label: 'Cập nhật tiến độ', icon: 'upload', visible: (task) => task.status === 'IN_PROGRESS', disabled: (task) => this.busyTaskId() === task.id },
      { key: 'history', label: 'Lịch sử', icon: 'history', visible: () => true, disabled: (task) => this.busyTaskId() === task.id },
    ],
    emptyText: 'Hiện chưa có công việc nào được giao cho bạn',
  };

  periodFilter = this.currentMonth();
  progressForm = { result: '', evidenceText: '' };
  readonly evidenceFiles = signal<File[]>([]);

  get taskTableConfig(): SsDtConfig<EmployeeTask> {
    return { ...this.taskTableSettings, loading: this.loading() };
  }

  ngOnInit(): void {
    this.load();
    this.loadMonthlyKpi();
  }

  start(task: EmployeeTask): void {
    this.runAction(task, this.api.start(task.id), 'Đã bắt đầu công việc');
  }

  openProgress(task: EmployeeTask): void {
    this.selectedTask.set(task);
    this.progressForm = { result: '', evidenceText: '' };
    this.evidenceFiles.set([]);
    this.progressVisible.set(true);
  }

  submitProgress(valid: boolean): void {
    const task = this.selectedTask();
    if (!task || !valid || this.busyTaskId() !== null) return;
    const evidenceLinks = this.progressForm.evidenceText.split(/\n+/).map((value) => value.trim()).filter(Boolean);
    if (evidenceLinks.some((link) => !/^https?:\/\/\S+$/i.test(link))) {
      this.toast.show({ severity: 'warning', summary: 'Đường dẫn minh chứng không hợp lệ', detail: 'Mỗi đường dẫn phải bắt đầu bằng http:// hoặc https://.' });
      return;
    }
    if (!evidenceLinks.length && !this.evidenceFiles().length) {
      this.toast.show({ severity: 'warning', summary: 'Cần bổ sung minh chứng', detail: 'Thêm ít nhất một hình ảnh, tệp hoặc đường dẫn.' });
      return;
    }
    if (this.evidenceFiles().some((file) => file.size > 10 * 1024 * 1024)) {
      this.toast.show({ severity: 'warning', summary: 'Tệp quá lớn', detail: 'Mỗi tệp minh chứng không được vượt quá 10 MB.' });
      return;
    }
    this.busyTaskId.set(task.id);
    this.api.submit(task.id, {
      result: this.progressForm.result.trim(),
      evidenceLinks,
    }, this.evidenceFiles()).subscribe({
      next: (updated) => {
        this.tasks.update((tasks) => tasks.map((item) => item.id === updated.id ? updated : item));
        this.progressVisible.set(false);
        this.selectedTask.set(null);
        this.toast.show({ severity: 'success', summary: 'Đã gửi kết quả chờ xác minh', detail: 'Chỉ số chỉ cập nhật sau khi quản lý nghiệm thu minh chứng.' });
      },
      error: () => this.busyTaskId.set(null),
      complete: () => this.busyTaskId.set(null),
    });
  }

  openHistory(task: EmployeeTask): void {
    this.selectedTask.set(task);
    this.progressHistory.set([]);
    this.historyVisible.set(true);
    this.historyLoading.set(true);
    this.api.getHistory(task.id, true).subscribe({
      next: (history) => this.progressHistory.set(history),
      error: () => this.toast.show({ severity: 'error', summary: 'Không tải được lịch sử', detail: 'Vui lòng mở lại công việc sau.' }),
      complete: () => this.historyLoading.set(false),
    });
  }

  closeProgress(): void {
    this.progressVisible.set(false);
    this.selectedTask.set(null);
    this.evidenceFiles.set([]);
  }

  onEvidenceFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selected = Array.from(input.files ?? []);
    if (selected.length > 5) {
      this.toast.show({ severity: 'warning', summary: 'Vượt quá số lượng tệp', detail: 'Mỗi lần nộp tối đa 5 tệp.' });
      input.value = '';
      return;
    }
    this.evidenceFiles.set(selected);
  }

  removeEvidenceFile(index: number): void {
    this.evidenceFiles.update((files) => files.filter((_, fileIndex) => fileIndex !== index));
  }

  closeHistory(): void {
    this.historyVisible.set(false);
    this.selectedTask.set(null);
  }

  onActionClick(event: SsDtActionClick<EmployeeTask>): void {
    if (event.action.key === 'start') this.start(event.row);
    if (event.action.key === 'submit') this.openProgress(event.row);
    if (event.action.key === 'history') this.openHistory(event.row);
  }

  formatCurrency(value: number): string {
    return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(value ?? 0)} VNĐ`;
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
    return status === 'PENDING' ? 'Chờ xác minh' : status === 'APPROVED' ? 'Đã nghiệm thu' : 'Cần bổ sung';
  }

  loadMonthlyKpi(): void {
    if (!this.periodFilter) return;
    this.api.getMyMonthlyKpi(this.periodFilter).subscribe({ next: (kpi) => this.monthlyKpi.set(kpi) });
  }

  private runAction(task: EmployeeTask, request: import('rxjs').Observable<EmployeeTask>, success: string): void {
    if (this.busyTaskId() !== null) return;
    this.busyTaskId.set(task.id);
    request.subscribe({
      next: (updated) => {
        this.tasks.update((tasks) => tasks.map((item) => item.id === updated.id ? updated : item));
        this.toast.show({ severity: 'success', summary: success, detail: 'Trạng thái công việc đã được cập nhật.' });
      },
      error: () => this.busyTaskId.set(null),
      complete: () => this.busyTaskId.set(null),
    });
  }

  private load(): void {
    this.api.getMine().subscribe({
      next: (tasks) => this.tasks.set(tasks),
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }

  private currentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
}
