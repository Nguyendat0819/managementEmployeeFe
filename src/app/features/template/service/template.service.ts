import { Injectable } from '@angular/core';
import { CrudBaseService, CrudEndpoints, API_ENDPOINTS } from '@core';
import { TemplateItem, CreateTemplateDto, UpdateTemplateDto } from '../model/template.model';

/**
 * Service mẫu minh họa cách kế thừa `CrudBaseService` từ `@core`:
 * - Tự động có sẵn các phương thức: `search()`, `create()`, `update()`, `detail()`, `remove()`.
 * - Toàn bộ request/response đều được type-safe chặt chẽ với TypeScript generics.
 */
@Injectable({
  providedIn: 'root',
})
export class TemplateService extends CrudBaseService<
  TemplateItem,
  CreateTemplateDto,
  UpdateTemplateDto
> {
  protected endpoints: CrudEndpoints = {
    BASE: API_ENDPOINTS.Template.BASE,
    SEARCH: API_ENDPOINTS.Template.SEARCH || '/search',
    CREATE: API_ENDPOINTS.Template.CREATE || '',
    UPDATE: API_ENDPOINTS.Template.UPDATE || '',
    DETAIL: API_ENDPOINTS.Template.DETAIL || '',
    DELETE: API_ENDPOINTS.Template.DELETE || '',
  };
}
