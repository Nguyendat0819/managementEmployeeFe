import { BaseService } from './base.service';
import { Observable } from 'rxjs';
import {ApiResponse, Page } from '../models/api-response.interface';
import {PageRequest} from '../models/api-request.interface';
export interface CrudEndpoints {
  BASE: string;
  SEARCH: string;
  CREATE: string;
  UPDATE: string;
  DETAIL: string;
  DELETE: string;
}
export abstract class CrudBaseService<
  TDetail, // Kiểu dữ liệu trả về khi gọi detail (ví dụ: UserProfileResponse)
  TCreate = unknown, // Kiểu dữ liệu request khi tạo mới (ví dụ: CreateUser)
  TUpdate = unknown, // Kiểu dữ liệu request khi cập nhật (ví dụ: UpdateUser)
  TSearch extends PageRequest = PageRequest, // Kiểu dữ liệu request khi tìm kiếm (ví dụ: UserSearchDto)
  TCreateResult = TDetail, // Kiểu dữ liệu trả về sau khi tạo (mặc định = TDetail, override nếu khác)
  TUpdateResult = TDetail, // Kiểu dữ liệu trả về sau khi update (mặc định = TDetail, override nếu khác)
  TCode = string, // Kiểu dữ liệu của khóa định danh (mặc định = string, có thể là number, UUID,…)
> extends BaseService {
  protected abstract endpoints: CrudEndpoints;

  search(req: TSearch): Observable<ApiResponse<Page<TDetail>>> {
    return this.post(this.endpoints.SEARCH, req, this.endpoints.BASE);
  }

  // Tạo mới -> trả về object vừa tạo.
  create(req: TCreate): Observable<ApiResponse<TCreateResult>> {
    return this.post(this.endpoints.CREATE, req, this.endpoints.BASE);
  }

  // Cập nhật -> trả về object vừa cập nhật.
  update(key: TCode, req: TUpdate): Observable<ApiResponse<TUpdateResult>> {
    return this.put(
      `${this.endpoints.UPDATE}/${encodeURIComponent(String(key))}`,
      req,
      this.endpoints.BASE,
    );
  }

  // Chi tiết
  detail(key: TCode): Observable<ApiResponse<TDetail>> {
    return this.get(
      `${this.endpoints.DETAIL}/${encodeURIComponent(String(key))}`,
      this.endpoints.BASE,
    );
  }

  // Xoá
  remove(key: TCode): Observable<ApiResponse<unknown>> {
    return this.delete(
      `${this.endpoints.DELETE}/${encodeURIComponent(String(key))}`,
      this.endpoints.BASE,
    );
  }
}
