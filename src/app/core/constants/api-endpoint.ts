export class API_ENDPOINTS {
  public static readonly Organization = {
    BASE: 'api/departments',
    CREATE: '',
    UPDATE: (deptCode: string) => `/${encodeURIComponent(deptCode)}`,
    DELETE: (deptCode: string) => `/${encodeURIComponent(deptCode)}`,
    GETEMPLOYEE: (deptCode: string) => `/${encodeURIComponent(deptCode)}/employees`,
  };

  public static readonly Employee = {
    BASE: 'api/employee',
    ME: '/me',
    MEPROFILE: '/profile-me',
    CATALOGS: '/catalogs',
    DETAIL: (id: number) => `/${id}`,
    SEARCH: '/search',
  };

  public static readonly EmployeeContract = {
    BASE: 'api/employee-contract',
    CONTRACTME: '/contract-me',
    DETAIL: (id: number) => `/${id}`,
    SEARCH: '/search',
  };

  public static readonly Attendance = {
    BASE: 'api/attendance',
    CHECK_IN: '/check-in',
    CHECK_OUT: '/check-out',
    HISTORY: '/history',
    RECORDS: '/records',
  };

  public static readonly AttendanceShift = {
    BASE: 'api/shifts',
  };

  public static readonly AttendanceShiftAssignment = {
    BASE: 'api/shift-assignments',
  };

  public static readonly Payroll = {
    SALARY_STRUCTURES: 'api/salary-structures',
    PAYROLL_RUNS: 'api/payroll-runs',
    HOLIDAYS: 'api/payroll-holidays',
    MY_PAYSLIPS: 'api/payslips/me',
  };

  public static readonly Role = {
    BASE: 'api/role',
    DETAIL: (id: number) => `/${id}`,
    SEARCH: '/search',
    POSITIONS: '/positions',
  };

  public static readonly Permission = {
    BASE: 'api/permission',
    DETAIL: (id: number) => `/${id}`,
    SEARCH: '/search',
  };

  public static readonly RolePermission = {
    BASE: 'api/role-permission',
  };

  public static readonly Position = {
    BASE: 'api/position',
    DETAIL: (id: number) => `/${id}`,
    SEARCH: '/search',
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
