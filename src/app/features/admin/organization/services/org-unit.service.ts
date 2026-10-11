import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiResponse } from '@core/models/api-response.interface';
import { BaseService } from '@core/services/base.service';
import { ORGANIZATION_MOCK_DATA } from '../data/organization.mock';
import { DepartmentResponse } from '../models/response.model';

@Injectable({ providedIn: 'root' })
export class OrgUnitService extends BaseService {
  getDepartments(): Observable<ApiResponse<DepartmentResponse[]>> {
    return of({
      code: 'SUCCESS',
      message: 'Mock organization data',
      traceId: 'organization-mock',
      data: ORGANIZATION_MOCK_DATA.map((department) => ({ ...department })),
    });
  }
}
