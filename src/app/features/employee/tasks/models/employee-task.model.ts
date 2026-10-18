export type EmployeeTaskStatus = 'TODO' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export interface EmployeeTask {
  id: number;
  employeeCode: string;
  title: string;
  description: string;
  acceptanceCriteria: string;
  periodMonth: string;
  dueDate: string | null;
  weight: number;
  bonusAmount: number;
  penaltyAmount: number;
  status: EmployeeTaskStatus;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  reviewComment: string | null;
  latestProgress: EmployeeTaskProgress | null;
}

export interface EmployeeTaskRequest {
  employeeCode: string;
  title: string;
  description: string;
  acceptanceCriteria: string;
  periodMonth: string;
  dueDate: string | null;
  weight: number;
  bonusAmount: number;
  penaltyAmount: number;
}

export interface EmployeeTaskProgress {
  id: number;
  result: string;
  evidenceLinks: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  reviewComment: string | null;
}

export interface EmployeeTaskProgressRequest {
  result: string;
  evidenceLinks: string[];
}

export interface MonthlyTaskKpi {
  employeeCode: string;
  periodMonth: string;
  taskCount: number;
  completedTaskCount: number;
  incompleteTaskCount: number;
  pendingReviewCount: number;
  completedWeight: number;
  totalWeight: number;
}
