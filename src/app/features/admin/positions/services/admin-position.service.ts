import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoint';
import { PageRequest } from '@core/models/api-request.interface';
import { ApiResponse, Page } from '@core/models/api-response.interface';
import { BaseService } from '@core/services/base.service';
import { PositionCreateRequest, PositionResponse, PositionUpdateRequest } from '../models/admin-position.model';

export interface PositionSearchRequest extends PageRequest {
  positionCode?: string;
  level?: string;
  isDeleted?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminPositionService extends BaseService {
  private readonly endpoint = API_ENDPOINTS.Position;

  searchPositions(request: PositionSearchRequest): Observable<ApiResponse<Page<PositionResponse>>> {
    return this.post<ApiResponse<Page<PositionResponse>>>(this.endpoint.SEARCH, request, this.endpoint.BASE);
  }

  getPosition(id: number): Observable<ApiResponse<PositionResponse>> {
    return this.get<ApiResponse<PositionResponse>>(this.endpoint.DETAIL(id), this.endpoint.BASE);
  }

  createPosition(request: PositionCreateRequest): Observable<ApiResponse<PositionResponse>> {
    return this.post<ApiResponse<PositionResponse>>('', request, this.endpoint.BASE);
  }

  updatePosition(id: number, request: PositionUpdateRequest): Observable<ApiResponse<PositionResponse>> {
    return this.put<ApiResponse<PositionResponse>>(this.endpoint.DETAIL(id), request, this.endpoint.BASE);
  }

  deletePosition(id: number): Observable<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(this.endpoint.DETAIL(id), this.endpoint.BASE);
  }
}
