/** Decisão tomada pelo totem na borda. */
export const accessDecisions = ["GRANTED", "DENIED"] as const;
export type AccessDecision = (typeof accessDecisions)[number];

/** Por que a porta não abriu. `null` quando foi concedido. Alinhado ao banco. */
export const accessDenialReasons = [
  "UNKNOWN_UID",
  "CREDENTIAL_BLOCKED",
  "CREDENTIAL_EXPIRED",
  "EMPLOYEE_INACTIVE",
  "OUTSIDE_WINDOW",
  "DUPLICATE_READ",
  "DEVICE_UNAUTHORIZED",
] as const;
export type AccessDenialReason = (typeof accessDenialReasons)[number];

/** Estado da rede no momento da leitura — o totem decide nos dois. */
export const accessModes = ["ONLINE", "OFFLINE", "REMOTE"] as const;
export type AccessMode = (typeof accessModes)[number];

export const timeEntryKinds = ["ENTRY", "EXIT"] as const;
export type TimeEntryKind = (typeof timeEntryKinds)[number];

export interface AccessEmployee {
  id: string;
  name: string;
  /** Matrícula. */
  registration: string;
  department: string;
}

export interface AccessDevice {
  id: string;
  name: string;
  location: string;
}

export interface AccessTimeEntry {
  kind: TimeEntryKind;
  /** ISO date (sem hora) do dia de ponto. */
  date: string;
  scheduleName: string;
}

/**
 * Um acesso é imutável: nunca é editado nem apagado. Correção de horário vira
 * ajuste no espelho de ponto, ligado a este evento.
 */
export interface AccessEvent {
  id: string;
  /** Carimbo do relógio dedicado do totem (com milissegundos). */
  occurredAt: string;
  /** Chegada no servidor. Igual a `occurredAt` + latência em modo online. */
  receivedAt: string;
  /** Desvio do relógio interno no momento da leitura. */
  clockDriftMs: number | null;
  decision: AccessDecision;
  denialReason: AccessDenialReason | null;
  mode: AccessMode;
  /** Preenchido só quando a leitura foi feita offline e subiu depois. */
  syncedAt: string | null;
  badgeCode: string;
  /** `null` = crachá sem vínculo no cadastro. */
  employee: AccessEmployee | null;
  device: AccessDevice;
  /** Tempo de acionamento da trava. `null` quando a porta não abriu. */
  doorOpenMs: number | null;
  /** `null` quando a leitura não virou ponto. */
  timeEntry: AccessTimeEntry | null;
}

export interface AccessStats {
  total: number;
  granted: number;
  denied: number;
  offline: number;
}

/** Resposta paginada de `GET /access-events` no backend real. */
export interface AccessEventPage {
  items: AccessEvent[];
  total: number;
  page: number;
  limit: number;
}

export const accessTimelineTones = ["done", "denied", "muted"] as const;
export type AccessTimelineTone = (typeof accessTimelineTones)[number];

/**
 * Passo da linha do tempo "O que aconteceu". O service escolhe a mensagem
 * (chave i18n + valores); o componente traduz.
 */
export interface AccessTimelineStep {
  id: string;
  tone: AccessTimelineTone;
  titleKey: string;
  bodyKey: string;
  bodyValues?: Record<string, string | number>;
  linkKey?: string;
  href?: string;
}

export interface AccessQueryArgs {
  limit?: number;
  scenario?: string;
}

/** Filtros estendidos para `/historico`. */
export interface AccessHistoryQueryArgs extends AccessQueryArgs {
  page?: number;
  from?: string;
  to?: string;
  decision?: AccessDecision | "ALL";
  mode?: AccessMode | "ALL";
  q?: string;
  badgeCode?: string;
}
