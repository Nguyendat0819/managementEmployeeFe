export class API_ENDPOINTS {
  public static readonly Organization = {
    BASE: 'api/departments',
    CREATE: '',
    UPDATE: (deptCode: string) => `/${encodeURIComponent(deptCode)}`,
    DELETE: (deptCode: string) => `/${encodeURIComponent(deptCode)}`,
    GETEMPLOYEE:(deptCode: string) =>`/${encodeURIComponent(deptCode)}/employees`
  };

  public static readonly Employee = {
    BASE: 'api/employee',
    DETAIL: (id: number) => `/${id}`,
    SEARCH: '/search',
  };

  public static readonly Role = {
    BASE: 'api/role',
    POSITIONS: '/positions',
  };

  public static readonly Template = {
    BASE: 'api/template',
    CREATE: '',
    SEARCH: '/search',
    UPDATE: '',
    DETAIL: '',
    DELETE: '',
    TEST: '/test',
  };
}
