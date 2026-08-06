export const badgeStatuses = ["ACTIVE", "BLOCKED", "UNASSIGNED"] as const;
export type BadgeStatus = (typeof badgeStatuses)[number];

export interface BadgeEmployeeRef {
  id: string;
  name: string;
}

export interface BadgeListItem {
  id: string;
  code: string;
  status: BadgeStatus;
  employee: BadgeEmployeeRef | null;
  department: string | null;
  linkedAt: string | null;
  passCount: number;
}

export interface BadgeQueryArgs {
  status?: BadgeStatus | "ALL";
  q?: string;
}
