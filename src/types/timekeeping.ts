export interface PendingSummary {
  /** Dias que precisam de decisão. */
  days: number;
  /** Quantos deles impedem o fechamento do período. */
  blockingClosure: number;
  /** Nome do período em aberto (ex.: "julho"). */
  periodLabel: string;
}

export interface AdjustmentSummary {
  /** Pedidos de correção aguardando análise. */
  count: number;
  /** Há quantos dias o mais antigo espera. */
  oldestWaitingDays: number;
}

export interface TimekeepingQueryArgs {
  scenario?: string;
}

export const timesheetMirrorStatuses = ["OPEN", "PENDING", "CONSOLIDATED"] as const;
export type TimesheetMirrorStatus = (typeof timesheetMirrorStatuses)[number];

export interface TimesheetMirrorEmployee {
  id: string;
  name: string;
  registration: string;
  department: string;
}

export interface TimesheetMirrorListItem {
  id: string;
  employee: TimesheetMirrorEmployee;
  month: string;
  status: TimesheetMirrorStatus;
  workedHours: string;
  balanceHours: string;
}

export interface TimesheetMirrorQueryArgs {
  month?: string;
  q?: string;
}
