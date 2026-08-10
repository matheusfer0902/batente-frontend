/**
 * `tipo_escala` do banco.
 *
 * Era `FIXED | ROTATING` aqui e `FIXED | FLEXIBLE` no PostgreSQL — a mesma
 * classe de divergência descrita na §8.2 de ARQUITETURA-MODULOS. O front se
 * alinha ao banco, nunca o contrário.
 */
export const scheduleTypes = ["FIXED", "FLEXIBLE"] as const;
export type ScheduleType = (typeof scheduleTypes)[number];

/** `0` = domingo … `6` = sábado, como `schedule_days.weekday`. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const weekdays: readonly Weekday[] = [0, 1, 2, 3, 4, 5, 6];

export interface ScheduleDay {
  weekday: Weekday;
  isWorkday: boolean;
  /** `HH:MM`. `null` em folga. */
  entryTime: string | null;
  breakStart: string | null;
  breakEnd: string | null;
  exitTime: string | null;
  expectedMinutes: number;
}

export interface ScheduleListItem {
  id: string;
  name: string;
  type: ScheduleType;
  toleranceMinutes: number;
  minBreakMinutes: number;
  active: boolean;
  /** Minutos, não horas decimais — 08:48 não sobrevive a `8.8`. */
  weeklyMinutes: number;
  employeeCount: number;
  days: ScheduleDay[];
}

export interface ScheduleDetail extends ScheduleListItem {
  createdAt: string;
}

export interface ScheduleDayPayload {
  weekday: Weekday;
  isWorkday: boolean;
  entryTime?: string | null;
  breakStart?: string | null;
  breakEnd?: string | null;
  exitTime?: string | null;
}

export interface SaveSchedulePayload {
  name: string;
  type: ScheduleType;
  toleranceMinutes: number;
  minBreakMinutes: number;
  active?: boolean;
  days: ScheduleDayPayload[];
}

export interface UpdateSchedulePayload extends SaveSchedulePayload {
  id: string;
}

/** Card "N pessoas sem escala" da tela 19. */
export interface UncoveredEmployees {
  count: number;
}
