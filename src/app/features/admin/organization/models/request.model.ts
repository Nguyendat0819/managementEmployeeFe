export type OrganizationFormMode = 'create' | 'child' | 'view' | 'edit' | 'relocate';

export interface DepartmentFormValue {
  deptCode: string;
  parentCode: string;
  name: string;
  code: string;
  headCode: string;
  level: number;
  isDeleted: boolean;
}

export interface DepartmentCreateRequest {
  deptCode: string;
  parentCode: string | null;
  name: string;
  code: string;
  headCode: string | null;
  level: number;
}

export interface DepartmentUpdateRequest {
  name: string;
  level: number;
}
