/**
 * `status_colaborador` do banco.
 *
 * Era `ACTIVE | VACATION | INACTIVE` aqui contra `ACTIVE | ON_LEAVE |
 * TERMINATED` no PostgreSQL — mesma divergência da §8.2. O rótulo em português
 * (ATIVO / FÉRIAS / DESLIGADO) fica no i18n; o valor é o do banco.
 */
export const employeeStatuses = ["ACTIVE", "ON_LEAVE", "TERMINATED"] as const;
export type EmployeeStatus = (typeof employeeStatuses)[number];

export interface EmployeeDepartmentRef {
  id: string;
  name: string;
}

export interface EmployeeListItem {
  id: string;
  name: string;
  registration: string;
  /** `null` = sem departamento. `employees.department_id` é opcional. */
  department: EmployeeDepartmentRef | null;
  /** `null` = sem crachá ativo. Não passa na portaria. */
  badgeCode: string | null;
  /** `null` = sem escala vigente. O ponto não é calculável (RN-6.2). */
  scheduleName: string | null;
  status: EmployeeStatus;
  flags: {
    missingBadge: boolean;
    missingSchedule: boolean;
  };
}

export interface EmployeeDetail extends EmployeeListItem {
  /** Máscara. O CPF em claro nunca sai do servidor. */
  cpfMask: string | null;
  position: string | null;
  hireDate: string;
  terminationDate: string | null;
  currentSchedule: {
    id: string;
    name: string;
    validFrom: string;
  } | null;
}

export interface EmployeeSummary {
  total: number;
  active: number;
  missingBadge: number;
  missingSchedule: number;
}

export type EmployeeFilter = "missing-badge" | "missing-schedule";

export interface EmployeeQueryArgs {
  status?: EmployeeStatus | "ALL";
  departmentId?: string;
  q?: string;
  /** Alertas operacionais da listagem. */
  filter?: EmployeeFilter;
  page?: number;
  limit?: number;
}

export interface EmployeeListPage {
  items: EmployeeListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateEmployeePayload {
  name: string;
  registration: string;
  cpf?: string;
  position?: string;
  departmentId?: string;
  hireDate: string;
  /** Obrigatória — RN-5.3 reprova ACTIVE sem escala vigente. */
  workScheduleId: string;
}

export interface UpdateEmployeePayload {
  id: string;
  name?: string;
  registration?: string;
  cpf?: string;
  position?: string;
  departmentId?: string;
}

export interface TerminateEmployeePayload {
  id: string;
  terminationDate: string;
}

export interface AssignSchedulePayload {
  id: string;
  workScheduleId: string;
  validFrom: string;
}
