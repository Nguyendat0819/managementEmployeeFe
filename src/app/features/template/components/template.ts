import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import {
  SsButtonComponent,
  SsCardComponent,
  SsTagComponent,
  SsBadgeComponent,
  SsAlertComponent,
  SsSpinComponent,
  SsDialogComponent,
  SsInputComponent,
  SsSelectComponent,
  SsToastService,
  SsConfirmService,
  SsDataTableComponent,
  SsDtColumn,
  SsDtConfig,
} from '@platform/ui-kit';
import { AuthService } from '@platform/shared';
import { TruncatePipe, FormatCurrencyPipe, SafeHtmlPipe } from '@shared';
import { environment } from '@env/environment';
import { TemplateService } from '../service/template.service';

interface SampleRecord {
  id: string;
  name: string;
  category: string;
  price: number;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  createdDate: string;
}

@Component({
  selector: 'template-module',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SsButtonComponent,
    SsCardComponent,
    SsTagComponent,
    SsBadgeComponent,
    SsAlertComponent,
    SsSpinComponent,
    SsDialogComponent,
    SsInputComponent,
    SsSelectComponent,
    SsDataTableComponent,
    TruncatePipe,
    FormatCurrencyPipe,
    SafeHtmlPipe,
  ],
  templateUrl: './template.html',
  styleUrl: './template.css',
})
export class templateModule {
  readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly toast = inject(SsToastService);
  private readonly confirm = inject(SsConfirmService);
  readonly templateService = inject(TemplateService);

  // Mẫu dữ liệu pipe
  readonly samplePrice = 12500000;
  readonly sampleLongText =
    'Dự án Template Angular Micro-Frontend được chuẩn hóa hoàn toàn theo kiến trúc mfe-platform-libs, hỗ trợ OIDC SSO và Design Tokens.';
  readonly sampleHtml =
    'Văn bản có chứa <strong>định dạng HTML an toàn</strong> thông qua pipe <code>SafeHtmlPipe</code>.';

  // State Dialog & Spin
  dialogVisible = false;
  isSpinning = false;
  inputText = 'Giá trị mẫu từ ss-input';
  selectedValue = 'opt1';
  selectOptions = [
    { label: 'Tùy chọn 1 — Hà Nội', value: 'opt1' },
    { label: 'Tùy chọn 2 — TP. Hồ Chí Minh', value: 'opt2' },
    { label: 'Tùy chọn 3 — Đà Nẵng', value: 'opt3' },
  ];

  // State API Test & Token Inspection
  apiLoading = false;
  apiResult: string | null = null;
  apiSuccess = false;

  // State Data Table
  readonly tableSettings: SsDtConfig<SampleRecord> = {
    bordered: true,
    striped: true,
    showPagination: true,
    pageSize: 5,
    searchable: true,
    searchPlaceholder: 'Tìm kiếm dịch vụ...',
  };

  readonly tableColumns: SsDtColumn<SampleRecord>[] = [
    { key: 'id', header: 'Mã', width: '110px' },
    { key: 'name', header: 'Tên Dịch Vụ' },
    { key: 'category', header: 'Phân Loại', width: '160px' },
    {
      key: 'price',
      header: 'Chi Phí',
      width: '160px',
      format: (row) =>
        new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
          maximumFractionDigits: 0,
        }).format(row.price),
    },
    { key: 'status', header: 'Trạng Thái', width: '140px' },
    { key: 'createdDate', header: 'Ngày Tạo', width: '130px' },
  ];

  readonly tableData: SampleRecord[] = [
    {
      id: 'MFE-001',
      name: 'Nền tảng Micro-Frontend Core',
      category: 'Hạ tầng',
      price: 25000000,
      status: 'ACTIVE',
      createdDate: '2026-09-01',
    },
    {
      id: 'MFE-002',
      name: 'Hệ thống Xác thực SSO OIDC',
      category: 'Bảo mật',
      price: 18500000,
      status: 'ACTIVE',
      createdDate: '2026-09-05',
    },
    {
      id: 'MFE-003',
      name: 'Bộ UI Kit Design Tokens',
      category: 'Giao diện',
      price: 12000000,
      status: 'PENDING',
      createdDate: '2026-09-12',
    },
    {
      id: 'MFE-004',
      name: 'Cổng thanh toán Gateway',
      category: 'Tài chính',
      price: 32000000,
      status: 'INACTIVE',
      createdDate: '2026-09-18',
    },
  ];

  // Token Helpers
  copyToken(): void {
    const token = this.authService.getToken();
    if (token) {
      navigator.clipboard.writeText(token);
      this.toast.show({
        severity: 'info',
        summary: 'Đã sao chép Access Token',
        detail: 'Token JWT đã được lưu vào clipboard.',
      });
    }
  }

  testCallApi(): void {
    this.apiLoading = true;
    this.apiResult = null;
    const url = `${environment.apiBaseUrl}/api/template/test`;

    this.http.get(url, { responseType: 'text' }).subscribe({
      next: (res) => {
        this.apiLoading = false;
        this.apiSuccess = true;
        this.apiResult = `[HTTP 200 OK]: ${res}\nHeader 'Authorization: Bearer <token>' đã gửi thành công.`;
        this.toast.show({
          severity: 'success',
          summary: 'Gọi API thành công',
          detail: 'Interceptor đã tự động gắn Bearer Token vào Header.',
        });
      },
      error: (err) => {
        this.apiLoading = false;
        this.apiSuccess = false;
        const hasToken = !!this.authService.getToken();
        this.apiResult = `[HTTP ${err.status || 0}]: ${err.message || 'Không thể kết nối máy chủ'}\n` +
          `• Header Authorization: ${hasToken ? 'Bearer ' + this.authService.getToken().substring(0, 25) + '...' : 'KHÔNG CÓ'}\n` +
          `• Target URL: ${url}\n` +
          `• Lưu ý: Hãy chắc chắn Backend Spring Boot (cổng 8080) đang chạy.`;
        this.toast.show({
          severity: 'error',
          summary: 'Gọi API thất bại',
          detail: err.status === 0
            ? 'Không thể kết nối máy chủ (HTTP 0). Hãy kiểm tra Backend Spring Boot.'
            : `Máy chủ phản hồi lỗi [HTTP ${err.status}].`,
        });
      },
    });
  }

  // Toast Demos
  showSuccess(): void {
    this.toast.show({
      severity: 'success',
      summary: 'Thao tác thành công',
      detail: 'Dữ liệu đã được cập nhật chính xác trên hệ thống.',
    });
  }

  showError(): void {
    this.toast.show({
      severity: 'error',
      summary: 'Thông báo lỗi',
      detail: 'Yêu cầu không thể hoàn tất. Vui lòng kiểm tra lại.',
    });
  }

  showWarning(): void {
    this.toast.show({
      severity: 'warning',
      summary: 'Cảnh báo phiên',
      detail: 'Phiên làm việc sẽ tự động làm mới qua silent refresh.',
    });
  }

  showInfo(): void {
    this.toast.show({
      severity: 'info',
      summary: 'Thông tin hệ thống',
      detail: 'Đang kết nối thư viện @platform/ui-kit và @platform/shared.',
    });
  }

  clearToasts(): void {
    this.toast.toasts().forEach((t) => this.toast.remove(t.id));
  }

  toggleSpin(): void {
    this.isSpinning = !this.isSpinning;
  }

  // Confirm Service Demo
  async openConfirm(): Promise<void> {
    const confirmed = await this.confirm.confirm(
      'Xác nhận thao tác?',
      'Thao tác này sẽ thực hiện cập nhật trên hệ thống.',
      { okText: 'Xác nhận', cancelText: 'Hủy' },
    );
    if (confirmed) {
      this.toast.show({
        severity: 'success',
        summary: 'Đã xác nhận',
        detail: 'Hành động đã được thực thi an toàn.',
      });
    }
  }

  openDialog(): void {
    this.dialogVisible = true;
  }

  closeDialog(): void {
    this.dialogVisible = false;
  }

  onLogout(): void {
    this.authService.logout();
  }
}
