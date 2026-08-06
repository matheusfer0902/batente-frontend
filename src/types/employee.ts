/** Situação cadastral do colaborador. */
export const employeeStatuses = ["ACTIVE", "VACATION", "INACTIVE"] as const;
export type EmployeeStatus = (typeof employeeStatuses)[number];

export interface EmployeeDepartmentRef {
  id: string;
  name: string;
}

export interface EmployeeListItem {
  id: string;
  name: string;
  registration: string;
  department: EmployeeDepartmentRef;
  /** null = sem crachá vinculado. */
  badgeCode: string | null;
  /** null = sem escala — ponto não calculável. */
  scheduleName: string | null;
  status: EmployeeStatus;
  flags: {
    missingBadge: boolean;
    missingSchedule: boolean;
  };
}

export interface EmployeeSummary {
  total: number;
  active: number;
  missingBadge: number;
  missingSchedule: number;
}

export interface EmployeeQueryArgs {
  status?: EmployeeStatus | "ALL";
  departmentId?: string;
  q?: string;
  /** Alertas operacionais da listagem. */
  filter?: "missing-badge" | "missing-schedule";
}

export interface CreateEmployeePayload {
  name: string;
  registration: string;
  departmentId: string;
}

export interface UpdateEmployeePayload {
  id: string;
  name?: string;
  registration?: string;
  departmentId?: string;
  status?: EmployeeStatus;
}
