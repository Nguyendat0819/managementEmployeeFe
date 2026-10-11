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
