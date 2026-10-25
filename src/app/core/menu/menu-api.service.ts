import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '@core/models/api-response.interface';
import { BaseService } from '@core/services/base.service';

export interface MenuRecord {
  id: number;
  menuCode: string;
  label: string;
  icon: string;
  iconColor: string | null;
  path: string | null;
  parentCode: string | null;
  sortOrder: number;
}

export type MenuPayload = Omit<MenuRecord, 'id'>;

@Injectable({ providedIn: 'root' })
export class MenuApiService extends BaseService {
  private readonly endpoint = 'api/menus';

  current(): Observable<ApiResponse<MenuRecord[]>> {
    return this.get<ApiResponse<MenuRecord[]>>('/me', this.endpoint).pipe(map(response => this.normalizeResponse(response)));
  }

  list(): Observable<ApiResponse<MenuRecord[]>> {
    return this.get<ApiResponse<MenuRecord[]>>('', this.endpoint).pipe(map(response => this.normalizeResponse(response)));
  }

  create(payload: MenuPayload): Observable<ApiResponse<MenuRecord>> {
    return this.post<ApiResponse<MenuRecord>>('', payload, this.endpoint);
  }

  update(id: number, payload: MenuPayload): Observable<ApiResponse<MenuRecord>> {
    return this.put<ApiResponse<MenuRecord>>(`/${id}`, payload, this.endpoint);
  }

  remove(id: number): Observable<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`/${id}`, this.endpoint);
  }

  roleMenus(roleCode: string): Observable<ApiResponse<string[]>> {
    return this.get<ApiResponse<string[]>>(`/roles/${encodeURIComponent(roleCode)}`, this.endpoint);
  }

  saveRoleMenus(roleCode: string, menuCodes: string[]): Observable<ApiResponse<void>> {
    return this.put<ApiResponse<void>>(`/roles/${encodeURIComponent(roleCode)}`, { menuCodes }, this.endpoint);
  }

  private normalizeResponse(response: ApiResponse<MenuRecord[]>): ApiResponse<MenuRecord[]> {
    const records = Array.isArray(response.data) ? response.data : [];
    return {
      ...response,
      data: records.map(value => {
        const raw = value as MenuRecord & Record<string, unknown>;
        const read = (camel: keyof MenuRecord, snake: string) => raw[camel] ?? raw[snake];
        return {
          id: Number(read('id', 'id')),
          menuCode: String(read('menuCode', 'menu_code') ?? ''),
          label: String(read('label', 'label') ?? ''),
          icon: String(read('icon', 'icon') ?? 'menu'),
          iconColor: (read('iconColor', 'icon_color') as string | null | undefined) ?? null,
          path: (read('path', 'path') as string | null | undefined) ?? null,
          parentCode: (read('parentCode', 'parent_code') as string | null | undefined)?.trim() || null,
          sortOrder: Number(read('sortOrder', 'sort_order') ?? 0),
        };
      }),
    };
  }
}
