export const absenceStatuses = ["ACTIVE", "SCHEDULED", "ENDED"] as const;
export type AbsenceStatus = (typeof absenceStatuses)[number];

export interface AbsenceTypeRef {
  id: string;
  name: string;
}

export interface AbsenceEmployeeRef {
  id: string;
  name: string;
  registration: string;
}

export interface AbsenceListItem {
  id: string;
  employee: AbsenceEmployeeRef;
  type: AbsenceTypeRef;
  startDate: string;
  endDate: string;
  days: number;
  status: AbsenceStatus;
}

export interface AbsenceQueryArgs {
  status?: AbsenceStatus | "ALL";
  q?: string;
}
