import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SsButtonComponent, SsSelectComponent } from '@platform/ui-kit';
import { finalize } from 'rxjs';
import { DepartmentFormValue, OrganizationFormMode } from '../../models/request.model';
import { DepartmentResponse } from '../../models/response.model';
import { OrgUnitService } from '../../services/org-unit.service';

@Component({
  selector: 'app-org-unit-form',
  standalone: true,
  imports: [CommonModule, FormsModule, SsButtonComponent, SsSelectComponent],
  templateUrl: './org-unit-form.component.html',
  styleUrl: './org-unit-form.component.css',
})
export class OrgUnitFormComponent implements OnChanges, OnInit {
  private readonly orgUnitService = inject(OrgUnitService);

  @Input() mode: OrganizationFormMode = 'create';
  @Input() department: DepartmentResponse | null = null;
  @Input() parentDepartment: DepartmentResponse | null = null;
  @Input() saving = false;
  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<DepartmentFormValue>();

  form: DepartmentFormValue = this.emptyForm();
  formError = '';
  employeeOptions: { label: string; value: string }[] = [];
  employeeLoading = false;
  departmentOptions: DepartmentResponse[] = [];

  get title(): string {
    if (this.mode === 'child') return 'Thêm đơn vị con';
    if (this.mode === 'view') return 'Xem đơn vị tổ chức';
    if (this.mode === 'edit') return 'Sửa đơn vị tổ chức';
    if (this.mode === 'relocate') return 'Chuyển đơn vị';
    return 'Thêm đơn vị tổ chức';
  }

  get description(): string {
    if (this.mode === 'view') return 'Thông tin ánh xạ từ bảng departments.';
    if (this.mode === 'relocate') return 'Cập nhật đơn vị cha trong dữ liệu mock.';
    return 'Các trường tương ứng với bảng departments.';
  }

  get readOnly(): boolean {
    return this.mode === 'view';
  }

  get fieldsReadOnly(): boolean {
    return this.mode === 'view' || this.mode === 'relocate';
  }

  get identityFieldsReadOnly(): boolean {
    return this.mode === 'view' || this.mode === 'edit' || this.mode === 'relocate';
  }

  get parentCodeReadOnly(): boolean {
    return this.mode === 'view' || this.mode === 'child' || this.mode === 'relocate';
  }

  get parentOptions(): DepartmentResponse[] {
    if (!this.department) return this.departmentOptions;
    const excluded = new Set([this.department.deptCode]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const item of this.departmentOptions) {
        if (item.parentCode && excluded.has(item.parentCode) && !excluded.has(item.deptCode)) {
          excluded.add(item.deptCode);
          changed = true;
        }
      }
    }
    return this.departmentOptions.filter((item) => !excluded.has(item.deptCode));
  }

  get parentSelectOptions(): { label: string; value: string }[] {
    return [
      { label: 'Không có đơn vị cha', value: '' },
      ...this.parentOptions.map((item) => ({
        label: `${item.name} (${item.deptCode})`,
        value: item.deptCode,
      })),
    ];
  }

  ngOnInit(): void {
    this.orgUnitService.getDepartments().subscribe({
      next: (response) => this.departmentOptions = response.data ?? [],
    });
    this.employeeLoading = true;
    this.orgUnitService.getEmployees()
      .pipe(finalize(() => this.employeeLoading = false))
      .subscribe({
        next: (response) => {
          this.employeeOptions = (response.data ?? []).map((employee) => ({
            label: `${employee.employeeCode} - ${employee.fullName}`,
            value: employee.employeeCode,
          }));
        },
    });
  }

  onParentCodeChange(parentCode: string | null): void {
    const selectedParentCode = parentCode ?? '';
    this.form.parentCode = selectedParentCode;
    this.form.level = selectedParentCode
      ? (this.departmentOptions.find((item) => item.deptCode === selectedParentCode)?.level ?? 0) + 1
      : 1;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mode'] || changes['department'] || changes['parentDepartment']) {
      this.form = this.department
        ? this.fromDepartment(this.department)
        : {
            ...this.emptyForm(),
            parentCode: this.parentDepartment?.deptCode ?? '',
            level: this.parentDepartment ? this.parentDepartment.level + 1 : 1,
          };
      this.formError = '';
    }
  }

  submit(formValid: boolean): void {
    if (!formValid || this.readOnly) return;

    const value = {
      ...this.form,
      deptCode: this.form.deptCode.trim(),
      parentCode: this.form.parentCode.trim(),
      name: this.form.name.trim(),
      code: this.form.code.trim(),
      headCode: this.form.headCode.trim(),
      level: Number(this.form.level),
    };

    if (!value.deptCode || !value.name || !value.code) {
      this.formError = 'Vui lòng nhập đủ deptCode, name và code.';
      return;
    }

    this.save.emit(value);
  }

  private fromDepartment(department: DepartmentResponse): DepartmentFormValue {
    return {
      deptCode: department.deptCode,
      parentCode: department.parentCode ?? '',
      name: department.name,
      code: department.code,
      headCode: department.headCode ?? '',
      level: department.level,
      isDeleted: department.isDeleted,
    };
  }

  private emptyForm(): DepartmentFormValue {
    return {
      deptCode: '',
      parentCode: '',
      name: '',
      code: '',
      headCode: '',
      level: 1,
      isDeleted: false,
    };
  }
}
