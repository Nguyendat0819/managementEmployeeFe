import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SsButtonComponent, SsCardComponent, SsConfirmService, SsDataTableComponent, SsDialogComponent, SsDtActionClick, SsDtButton, SsDtColumn, SsDtConfig, SsStatComponent, SsTagComponent, SsToastService } from '@platform/ui-kit';
import { AdminLeavePolicy, AdminLeavePolicyStatus } from '../../models/admin-leave-policy.model';
import { AdminLeavePolicyService } from '../../services/admin-leave-policy.service';

interface LeavePolicyForm {
  code: string;
  name: string;
  annualQuota: number;
  carryoverDays: number;
  paidLeave: boolean;
  requireDocument: boolean;
  status: AdminLeavePolicyStatus;
  description: string;
}

@Component({
  selector: 'app-admin-leave-policy',
  standalone: true,
  imports: [CommonModule, FormsModule, SsButtonComponent, SsCardComponent, SsDataTableComponent, SsDialogComponent, SsStatComponent, SsTagComponent],
  templateUrl: './admin-leave-policy.component.html',
  styleUrl: './admin-leave-policy.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLeavePolicyComponent {
  private readonly policyService = inject(AdminLeavePolicyService);
  private readonly confirmService = inject(SsConfirmService);
  private readonly toast = inject(SsToastService);

  readonly policies = signal<AdminLeavePolicy[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly selectedPolicy = signal<AdminLeavePolicy | null>(null);
  readonly detailVisible = signal(false);
  readonly formVisible = signal(false);
  readonly editingPolicy = signal<AdminLeavePolicy | null>(null);
  readonly policyForm: LeavePolicyForm = this.emptyPolicyForm();
  readonly policyColumns: SsDtColumn<AdminLeavePolicy>[] = [
    { key: 'code', header: 'Mã chính sách', field: 'code', width: '145px', sortable: true, filterable: true },
    { key: 'name', header: 'Tên loại phép', field: 'name', width: '190px', sortable: true, filterable: true },
    { key: 'annualQuota', header: 'Hạn mức năm', format: (row) => `${row.annualQuota} ngày`, width: '130px', align: 'right', sortable: true },
    { key: 'carryoverDays', header: 'Chuyển năm sau', format: (row) => row.carryoverDays ? `${row.carryoverDays} ngày` : 'Không', width: '145px', align: 'right', sortable: true },
    { key: 'paidLeave', header: 'Hưởng lương', field: 'paidLeave', type: 'status', width: '125px', options: [{ label: 'Có', value: true, color: '#32b36b' }, { label: 'Không', value: false, color: '#7d8da6' }] },
    { key: 'requireDocument', header: 'Cần hồ sơ', field: 'requireDocument', type: 'status', width: '120px', options: [{ label: 'Bắt buộc', value: true, color: '#f59f3d' }, { label: 'Không', value: false, color: '#7d8da6' }] },
    { key: 'status', header: 'Trạng thái', field: 'status', type: 'status', width: '135px', options: [{ label: 'Đang áp dụng', value: 'Đang áp dụng', color: '#32b36b' }, { label: 'Tạm khóa', value: 'Tạm khóa', color: '#7d8da6' }] },
  ];

  policyTableSettings: SsDtConfig<AdminLeavePolicy> = {
    rowKey: 'id',
    title: 'Danh mục loại phép',
    description: 'Quản lý hạn mức và điều kiện áp dụng cho từng loại nghỉ phép',
    cardIcon: 'solution',
    cardStatusLabel: `${this.activePolicyCount} loại đang dùng`,
    cardStatusType: 'success',
    primaryButtons: [{ key: 'create-policy', label: 'Thêm loại phép', type: 'primary', icon: 'plus' }],
    searchable: true,
    searchPlaceholder: 'Tìm theo mã, tên loại phép hoặc mô tả',
    showSort: true,
    showFilter: true,
    showSetting: true,
    showPagination: true,
    pageSize: 6,
    pageSizeOptions: [6, 10, 20],
    rowActions: [
      { key: 'detail', label: 'Xem chi tiết', icon: 'eye' },
      { key: 'edit', label: 'Sửa', icon: 'edit' },
      { key: 'delete', label: 'Tạm khóa', icon: 'close', danger: true },
    ],
    quickFilters: [
      { key: 'status', placeholder: 'Tất cả trạng thái', options: [{ label: 'Đang áp dụng', value: 'Đang áp dụng' }, { label: 'Tạm khóa', value: 'Tạm khóa' }] },
      { key: 'paidLeave', placeholder: 'Tất cả chế độ lương', options: [{ label: 'Có hưởng lương', value: true }, { label: 'Không hưởng lương', value: false }] },
    ],
    striped: true,
    size: 'small',
    scrollX: '1120px',
    emptyText: 'Không có loại phép phù hợp',
  };

  constructor() {
    this.loadPolicies();
  }

  get activePolicyCount(): number {
    return this.policies().filter((policy) => policy.status === 'Đang áp dụng').length;
  }

  get totalAnnualQuota(): number {
    return this.policies().filter((policy) => policy.status === 'Đang áp dụng').reduce((total, policy) => total + policy.annualQuota, 0);
  }

  get paidPolicyCount(): number {
    return this.policies().filter((policy) => policy.paidLeave && policy.status === 'Đang áp dụng').length;
  }

  get carryoverPolicyCount(): number {
    return this.policies().filter((policy) => policy.carryoverDays > 0).length;
  }

  onPrimaryClick(button: SsDtButton): void {
    if (button.key === 'create-policy') this.openCreateDialog();
  }

  onActionClick(event: SsDtActionClick<AdminLeavePolicy>): void {
    if (event.action.key === 'detail') {
      this.selectedPolicy.set(event.row);
      this.detailVisible.set(true);
      return;
    }
    if (event.action.key === 'edit') {
      this.openEditDialog(event.row);
      return;
    }
    if (event.action.key === 'delete') void this.deletePolicy(event.row);
  }

  openCreateDialog(): void {
    Object.assign(this.policyForm, this.emptyPolicyForm());
    this.editingPolicy.set(null);
    this.formVisible.set(true);
  }

  openEditDialog(policy: AdminLeavePolicy): void {
    Object.assign(this.policyForm, { ...policy });
    this.editingPolicy.set(policy);
    this.formVisible.set(true);
  }

  closeDetail(): void {
    this.detailVisible.set(false);
  }

  closeFormDialog(): void {
    this.formVisible.set(false);
  }

  savePolicy(formValid: boolean): void {
    if (!formValid) return;
    const code = this.policyForm.code.trim().toUpperCase().replace(/\s+/g, '-');
    const name = this.policyForm.name.trim();
    const editingPolicy = this.editingPolicy();
    if (this.policies().some((policy) => policy.id !== editingPolicy?.id && policy.code.toLowerCase() === code.toLowerCase())) {
      this.toast.show({ severity: 'warning', summary: 'Mã chính sách đã tồn tại', detail: 'Vui lòng sử dụng một mã loại phép khác.' });
      return;
    }

    const policy: AdminLeavePolicy = {
      id: editingPolicy?.id ?? Date.now(),
      code,
      name,
      annualQuota: Number(this.policyForm.annualQuota),
      carryoverDays: Number(this.policyForm.carryoverDays),
      paidLeave: this.policyForm.paidLeave,
      requireDocument: this.policyForm.requireDocument,
      status: this.policyForm.status,
      description: this.policyForm.description.trim(),
    };

    this.saving.set(true);
    this.policyService.savePolicy(editingPolicy?.id ?? null, policy).subscribe({
      next: (savedPolicy) => {
        this.policies.update((policies) => editingPolicy
          ? policies.map((item) => item.id === savedPolicy.id ? savedPolicy : item)
          : [...policies, savedPolicy]);
        this.refreshTableStatus();
        this.closeFormDialog();
        this.toast.show({ severity: 'success', summary: editingPolicy ? 'Cập nhật chính sách thành công' : 'Thêm loại phép thành công', detail: `Chính sách ${name} đã được ${editingPolicy ? 'cập nhật' : 'thêm vào danh mục'}.` });
      },
      error: () => this.saving.set(false),
      complete: () => this.saving.set(false),
    });
  }

  async deletePolicy(policy: AdminLeavePolicy): Promise<void> {
    const confirmed = await this.confirmService.confirm(
      'Xác nhận tạm khóa loại phép',
      `Bạn có chắc muốn ngừng áp dụng chính sách "${policy.name}" không?`,
      { type: 'warning', okText: 'Tạm khóa' },
    );
    if (!confirmed) return;
    this.policyService.deletePolicy(policy.id).subscribe({
      next: () => {
        this.policies.update((policies) => policies.map((item) => item.id === policy.id ? { ...item, status: 'Tạm khóa' } : item));
        this.refreshTableStatus();
        this.toast.show({ severity: 'success', summary: 'Đã khóa loại phép', detail: `Chính sách ${policy.name} đã được chuyển sang trạng thái tạm khóa.` });
      },
      error: () => undefined,
    });
  }

  statusTone(status: AdminLeavePolicyStatus): 'success' | 'warning' | 'info' {
    return status === 'Đang áp dụng' ? 'success' : 'info';
  }

  private emptyPolicyForm(): LeavePolicyForm {
    return { code: '', name: '', annualQuota: 12, carryoverDays: 0, paidLeave: true, requireDocument: false, status: 'Đang áp dụng', description: '' };
  }

  private refreshTableStatus(): void {
    this.policyTableSettings = { ...this.policyTableSettings, cardStatusLabel: `${this.activePolicyCount} loại đang dùng` };
  }

  private loadPolicies(): void {
    this.loading.set(true);
    this.policyService.getPolicies().subscribe({
      next: (policies) => {
        this.policies.set(policies);
        this.refreshTableStatus();
      },
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }
}
