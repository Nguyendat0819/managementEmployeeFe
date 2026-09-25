import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { Injector, Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SsToastService } from '@platform/ui-kit';
import { environment } from '@env/environment';
import { logError } from '../log/logger';

export interface RequestOptions {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> };
  observe?: 'body';
  responseType?: 'json';
  withCredentials?: boolean;
  [key: string]: unknown;
}

@Injectable({
  providedIn: 'root',
})
export class BaseService {
  protected http: HttpClient;
  protected router: Router;
  protected toast: SsToastService;

  constructor(protected readonly injector?: Injector) {
    if (this.injector) {
      this.http = this.injector.get(HttpClient);
      this.router = this.injector.get(Router);
      this.toast = this.injector.get(SsToastService);
    } else {
      this.http = inject(HttpClient);
      this.router = inject(Router);
      this.toast = inject(SsToastService);
    }
  }

  // ==========================================
  // Tiện ích Toast thông báo trực tiếp
  // ==========================================

  public showSuccess(summary: string, detail?: string): void {
    this.toast.show({ severity: 'success', summary, detail });
  }

  public showError(summary: string, detail?: string): void {
    this.toast.show({ severity: 'error', summary, detail });
  }

  public showWarning(summary: string, detail?: string): void {
    this.toast.show({ severity: 'warning', summary, detail });
  }

  public showInfo(summary: string, detail?: string): void {
    this.toast.show({ severity: 'info', summary, detail });
  }

  /**
   * Ghép URL hoàn chỉnh từ BaseUrl + ContextPath + EndpointController + EndpointMethod,
   * tự động loại bỏ các dấu gạch chéo dư thừa (//).
   */
  protected buildUrl(endpointMethod: string, endpointController?: string): string {
    if (!endpointController) {
      return endpointMethod;
    }

    const rawBaseUrl = environment.apiBaseUrl;
    const base = (Array.isArray(rawBaseUrl) ? rawBaseUrl[0] : (rawBaseUrl || '')).replace(/\/+$/, '');
    const context = environment.contextPath ? `/${environment.contextPath.replace(/^\/+|\/+$/g, '')}` : '';
    const controller = endpointController ? `/${endpointController.replace(/^\/+|\/+$/g, '')}` : '';
    const method = endpointMethod ? (endpointMethod.startsWith('/') ? endpointMethod : `/${endpointMethod}`) : '';

    return `${base}${context}${controller}${method}`;
  }

  private getDefaultHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
    });
  }

  private prepareOptions(options?: RequestOptions): RequestOptions {
    const headers = options?.headers ?? this.getDefaultHeaders();
    return {
      ...options,
      headers,
    };
  }

  /**
   * Xử lý và chuẩn hóa lỗi HTTP trả về cho tầng gọi, tự động hiển thị Toast qua SsToastService.
   */
  public handleError(error: HttpErrorResponse, notifyToast = true): Observable<never> {
    const detailedError = error.error && typeof error.error === 'object' ? error.error : null;
    const userMessage = this.toUserMessage(error, detailedError);

    logError('[BaseService] HTTP Error:', {
      status: error.status,
      url: error.url,
      message: error.message,
      detail: detailedError,
    });

    if (notifyToast && error.status !== 401) {
      this.toast.show({
        severity: 'error',
        summary: error.status === 0 ? 'Lỗi kết nối' : error.status >= 500 ? 'Lỗi máy chủ' : 'Lỗi yêu cầu',
        detail: userMessage,
      });
    }

    return throwError(() => ({
      status: error.status,
      message: userMessage,
      errorDetail: detailedError,
      raw: error,
    }));
  }

  private toUserMessage(error: HttpErrorResponse, detailedError: any): string {
    if (error.error instanceof ErrorEvent || error.status === 0) {
      return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng.';
    }
    if (error.status === 401) {
      return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    }
    if (error.status === 403) {
      return 'Bạn không có quyền thực hiện thao tác này.';
    }
    if (error.status === 404) {
      return 'Tài nguyên yêu cầu không tồn tại.';
    }
    if (error.status >= 500) {
      return 'Hệ thống máy chủ đang gặp sự cố. Vui lòng thử lại sau.';
    }
    return detailedError?.message || detailedError?.data || 'Yêu cầu không hợp lệ.';
  }

  // ==========================================
  // HTTP Methods (GET, POST, PUT, PATCH, DELETE)
  // ==========================================

  public get<T>(
    endpointMethod: string,
    endpointController?: string,
    options?: RequestOptions,
  ): Observable<T> {
    const url = this.buildUrl(endpointMethod, endpointController);
    return (this.http.get<T>(url, this.prepareOptions(options) as any) as Observable<T>).pipe(
      catchError((err) => this.handleError(err)),
    );
  }

  public post<T>(
    endpointMethod: string,
    data: unknown,
    endpointController?: string,
    options?: RequestOptions,
  ): Observable<T> {
    const url = this.buildUrl(endpointMethod, endpointController);
    return (this.http.post<T>(url, data, this.prepareOptions(options) as any) as Observable<T>).pipe(
      catchError((err) => this.handleError(err)),
    );
  }

  public put<T>(
    endpointMethod: string,
    data: unknown,
    endpointController?: string,
    options?: RequestOptions,
  ): Observable<T> {
    const url = this.buildUrl(endpointMethod, endpointController);
    return (this.http.put<T>(url, data, this.prepareOptions(options) as any) as Observable<T>).pipe(
      catchError((err) => this.handleError(err)),
    );
  }

  public patch<T>(
    endpointMethod: string,
    data: unknown,
    endpointController?: string,
    options?: RequestOptions,
  ): Observable<T> {
    const url = this.buildUrl(endpointMethod, endpointController);
    return (this.http.patch<T>(url, data, this.prepareOptions(options) as any) as Observable<T>).pipe(
      catchError((err) => this.handleError(err)),
    );
  }

  public delete<T>(
    endpointMethod: string,
    endpointController?: string,
    options?: RequestOptions,
  ): Observable<T> {
    const url = this.buildUrl(endpointMethod, endpointController);
    return (this.http.delete<T>(url, this.prepareOptions(options) as any) as Observable<T>).pipe(
      catchError((err) => this.handleError(err)),
    );
  }
}
