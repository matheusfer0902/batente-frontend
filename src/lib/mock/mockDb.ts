import type { Resource } from "@/types/resource";
import type { User } from "@/types/auth";
import { LOGIN_LOCKOUT_MINUTES, MAX_LOGIN_ATTEMPTS } from "@/types/auth";
import type { AccessEvent, AccessStats } from "@/types/access";
import type { Device, DeviceDetail } from "@/types/device";
import type { AdjustmentSummary, PendingSummary } from "@/types/timekeeping";
import type { Department } from "@/types/department";
import type { EmployeeListItem } from "@/types/employee";
import type { BadgeListItem } from "@/types/badge";
import type { ScheduleListItem } from "@/types/schedule";
import type { AbsenceListItem } from "@/types/absence";
import type { AuditLogListItem } from "@/types/audit";
import type { GateCredential, GateQueueEntry } from "@/types/gate";
import type { SettingItem } from "@/types/settings";
import type { UserListItem } from "@/types/user";
import type { TimesheetMirrorListItem } from "@/types/timekeeping";

interface MockUserRecord extends User {
  password: string;
}

/** Tentativas por e-mail — contadas mesmo para e-mails inexistentes. */
export interface LoginAttemptRecord {
  failedAttempts: number;
  lockedAt: string | null;
  unlockAt: string | null;
}

interface MockDatabase {
  users: MockUserRecord[];
  resources: Resource[];
  sessions: Record<string, string>;
  loginAttempts: Record<string, LoginAttemptRecord>;
  devices: Device[];
  deviceDetails: Record<string, DeviceDetail>;
  departments: Department[];
  employees: EmployeeListItem[];
  badges: BadgeListItem[];
  schedules: ScheduleListItem[];
  absences: AbsenceListItem[];
  auditLogs: AuditLogListItem[];
  gateQueue: GateQueueEntry[];
  gateCredentials: GateCredential[];
  settings: SettingItem[];
  panelUsers: UserListItem[];
  timesheetMirrors: TimesheetMirrorListItem[];
  accessEvents: AccessEvent[];
  accessStats: AccessStats;
  pendingSummary: PendingSummary;
  adjustmentSummary: AdjustmentSummary;
}

const now = new Date().toISOString();

/**
 * Base de tempo do dataset. Os acessos são fatos históricos: ficam presos a
 * este instante. Já o batimento do totem é recalculado a cada requisição.
 */
const bootedAt = Date.now();

function isoSecondsAgo(seconds: number, millisecondOffset = 0): string {
  return new Date(bootedAt - seconds * 1000 + millisecondOffset).toISOString();
}

/** Latência típica entre o carimbo do totem e a chegada no servidor. */
const UPLINK_LATENCY_MS = 356;

interface AccessSeed {
  id: string;
  secondsAgo: number;
  millisecondOffset: number;
  badgeCode: string;
  employee: AccessEvent["employee"];
  decision: AccessEvent["decision"];
  denialReason: AccessEvent["denialReason"];
  mode: AccessEvent["mode"];
  /** Segundos atrás em que a fila offline subiu. */
  syncedSecondsAgo?: number;
  clockDriftMs: number | null;
  doorOpenMs: number | null;
  timeEntry: AccessEvent["timeEntry"];
}

const PRIMARY_DEVICE: Device = {
  id: "device-1",
  name: "Totem 01",
  location: "Portaria principal",
  status: "ONLINE",
  lastContactAt: isoSecondsAgo(4),
  clockDriftMs: 18,
  pendingUploads: 0,
};

const TODAY = new Date(bootedAt).toISOString().slice(0, 10);

const ACCESS_SEEDS: AccessSeed[] = [
  {
    id: "9f1c8a2e-4b7d",
    secondsAgo: 4,
    millisecondOffset: 118,
    badgeCode: "04A2B3C4",
    employee: {
      id: "employee-1",
      name: "Ana Carolina Souza",
      registration: "20220023770",
      department: "Operações",
    },
    decision: "GRANTED",
    denialReason: null,
    mode: "ONLINE",
    clockDriftMs: 18,
    doorOpenMs: 3000,
    timeEntry: { kind: "ENTRY", date: TODAY, scheduleName: "Administrativo 44h" },
  },
  {
    id: "7b3d5c10-92af",
    secondsAgo: 25,
    millisecondOffset: 402,
    badgeCode: "04B7C1D9",
    employee: {
      id: "employee-2",
      name: "Marcos Ferreira",
      registration: "20190014522",
      department: "Manutenção",
    },
    decision: "GRANTED",
    denialReason: null,
    mode: "ONLINE",
    clockDriftMs: 18,
    doorOpenMs: 3000,
    timeEntry: { kind: "ENTRY", date: TODAY, scheduleName: "Operacional 12x36" },
  },
  {
    id: "2c66e401-b8d3",
    secondsAgo: 174,
    millisecondOffset: 771,
    badgeCode: "0A11FF02",
    employee: null,
    decision: "DENIED",
    denialReason: "UNKNOWN_UID",
    mode: "ONLINE",
    clockDriftMs: 18,
    doorOpenMs: null,
    timeEntry: null,
  },
  {
    id: "5ad91f7c-3e02",
    secondsAgo: 332,
    millisecondOffset: 55,
    badgeCode: "04C3E8A1",
    employee: {
      id: "employee-3",
      name: "Beatriz Moura",
      registration: "20210009845",
      department: "Administrativo",
    },
    decision: "GRANTED",
    denialReason: null,
    mode: "OFFLINE",
    syncedSecondsAgo: 240,
    clockDriftMs: null,
    doorOpenMs: 3000,
    timeEntry: { kind: "ENTRY", date: TODAY, scheduleName: "Administrativo 44h" },
  },
  {
    id: "8e40b2d6-71ca",
    secondsAgo: 713,
    millisecondOffset: 903,
    badgeCode: "04D9A0F5",
    employee: {
      id: "employee-4",
      name: "Rodrigo Bastos",
      registration: "20230031190",
      department: "Logística",
    },
    decision: "GRANTED",
    denialReason: null,
    mode: "ONLINE",
    clockDriftMs: 21,
    doorOpenMs: 3000,
    timeEntry: { kind: "ENTRY", date: TODAY, scheduleName: "Operacional 12x36" },
  },
  {
    id: "1d7fa093-5c68",
    secondsAgo: 847,
    millisecondOffset: 240,
    badgeCode: "04E1B7C0",
    employee: {
      id: "employee-5",
      name: "Juliana Prado",
      registration: "20180007311",
      department: "Financeiro",
    },
    decision: "GRANTED",
    denialReason: null,
    mode: "ONLINE",
    clockDriftMs: 21,
    doorOpenMs: 3000,
    timeEntry: { kind: "ENTRY", date: TODAY, scheduleName: "Administrativo 44h" },
  },
];

function toAccessEvent(seed: AccessSeed): AccessEvent {
  const occurredAt = isoSecondsAgo(seed.secondsAgo, seed.millisecondOffset);
  const receivedAt =
    seed.mode === "OFFLINE" && seed.syncedSecondsAgo !== undefined
      ? isoSecondsAgo(seed.syncedSecondsAgo)
      : isoSecondsAgo(seed.secondsAgo, seed.millisecondOffset + UPLINK_LATENCY_MS);

  return {
    id: seed.id,
    occurredAt,
    receivedAt,
    clockDriftMs: seed.clockDriftMs,
    decision: seed.decision,
    denialReason: seed.denialReason,
    mode: seed.mode,
    syncedAt:
      seed.syncedSecondsAgo === undefined
        ? null
        : isoSecondsAgo(seed.syncedSecondsAgo),
    badgeCode: seed.badgeCode,
    employee: seed.employee,
    device: {
      id: PRIMARY_DEVICE.id,
      name: PRIMARY_DEVICE.name,
      location: PRIMARY_DEVICE.location,
    },
    doorOpenMs: seed.doorOpenMs,
    timeEntry: seed.timeEntry,
  };
}

const LOCKOUT_MS = LOGIN_LOCKOUT_MINUTES * 60 * 1000;

/** Prefixo de e-mail que simula servidor fora do ar (estado 1e). */
const OUTAGE_EMAIL_PREFIX = "offline";

export const mockDb: MockDatabase = {
  users: [
    {
      id: "user-1",
      email: "owner@batente.dev",
      name: "Owner User",
      role: "ADMIN",
      password: "password123",
    },
    {
      id: "user-2",
      email: "viewer@batente.dev",
      name: "Viewer User",
      role: "OPERADOR",
      password: "password123",
    },
    {
      id: "user-3",
      email: "rh@construtoravale.com.br",
      name: "Marina Vale",
      role: "RH",
      password: "password123",
    },
  ],
  resources: [
    {
      id: "resource-1",
      title: "Primeiro recurso",
      description: "Recurso de exemplo pertencente ao owner.",
      ownerId: "user-1",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "resource-2",
      title: "Segundo recurso",
      description: "Outro recurso para demonstrar listagem e filtros.",
      ownerId: "user-1",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "resource-3",
      title: "Recurso do viewer",
      description: "Recurso de outro usuário para demo de ownership.",
      ownerId: "user-2",
      createdAt: now,
      updatedAt: now,
    },
  ],
  sessions: {},
  loginAttempts: {},
  devices: [PRIMARY_DEVICE],
  deviceDetails: {
    "device-1": {
      id: "device-1",
      name: "Totem 01",
      location: "Portaria principal",
      status: "ONLINE",
      lastContactAt: PRIMARY_DEVICE.lastContactAt,
      clockDriftMs: 18,
      pendingUploads: 0,
      firmwareVersion: "v2.4.1",
      serialNumber: "BT-0001-0042",
      doorOpenMs: 3000,
      badgeListVersion: "1842",
      badgeListSyncedAt: new Date().toISOString(),
      recentEvents: [],
    },
  },
  departments: [
    { id: "dept-ops", name: "Operações", employeeCount: 2 },
    { id: "dept-maint", name: "Manutenção", employeeCount: 1 },
    { id: "dept-admin", name: "Administrativo", employeeCount: 1 },
    { id: "dept-log", name: "Logística", employeeCount: 1 },
    { id: "dept-fin", name: "Financeiro", employeeCount: 0 },
    { id: "dept-third", name: "Terceirizados", employeeCount: 0 },
  ],
  employees: [
    {
      id: "employee-1",
      name: "Ana Carolina Souza",
      registration: "20220023770",
      department: { id: "dept-ops", name: "Operações" },
      badgeCode: "04A2B3C4",
      scheduleName: "Administrativo 44h",
      status: "ACTIVE",
      flags: { missingBadge: false, missingSchedule: false },
    },
    {
      id: "employee-2",
      name: "Marcos Ferreira",
      registration: "20190014522",
      department: { id: "dept-maint", name: "Manutenção" },
      badgeCode: "04B7C1D9",
      scheduleName: "Operacional 12x36",
      status: "ACTIVE",
      flags: { missingBadge: false, missingSchedule: false },
    },
    {
      id: "employee-3",
      name: "Priscila Tavares",
      registration: "20260004120",
      department: { id: "dept-ops", name: "Operações" },
      badgeCode: null,
      scheduleName: "Administrativo 44h",
      status: "ACTIVE",
      flags: { missingBadge: true, missingSchedule: false },
    },
    {
      id: "employee-4",
      name: "Rodrigo Bastos",
      registration: "20230031190",
      department: { id: "dept-log", name: "Logística" },
      badgeCode: "04D9A0F5",
      scheduleName: null,
      status: "ACTIVE",
      flags: { missingBadge: false, missingSchedule: true },
    },
    {
      id: "employee-5",
      name: "Beatriz Moura",
      registration: "20210009845",
      department: { id: "dept-admin", name: "Administrativo" },
      badgeCode: "04C3E8A1",
      scheduleName: "Administrativo 44h",
      status: "VACATION",
      flags: { missingBadge: false, missingSchedule: false },
    },
    {
      id: "employee-6",
      name: "Juliana Prado",
      registration: "20180007311",
      department: { id: "dept-fin", name: "Financeiro" },
      badgeCode: "04E1B7C0",
      scheduleName: "Administrativo 44h",
      status: "ACTIVE",
      flags: { missingBadge: false, missingSchedule: false },
    },
    {
      id: "employee-7",
      name: "Eduardo Lins",
      registration: "20170002044",
      department: { id: "dept-ops", name: "Operações" },
      badgeCode: "04F2A1B8",
      scheduleName: "Administrativo 44h",
      status: "INACTIVE",
      flags: { missingBadge: false, missingSchedule: false },
    },
  ],
  badges: [
    {
      id: "badge-1",
      code: "04A2B3C4",
      status: "ACTIVE",
      employee: { id: "employee-1", name: "Ana Carolina Souza" },
      department: "Operações",
      linkedAt: "2022-02-02T00:00:00.000Z",
      passCount: 1284,
    },
    {
      id: "badge-2",
      code: "04B7C1D9",
      status: "ACTIVE",
      employee: { id: "employee-2", name: "Marcos Ferreira" },
      department: "Manutenção",
      linkedAt: "2019-03-14T00:00:00.000Z",
      passCount: 3902,
    },
    {
      id: "badge-3",
      code: "04C3E8A1",
      status: "ACTIVE",
      employee: { id: "employee-5", name: "Beatriz Moura" },
      department: "Administrativo",
      linkedAt: "2021-06-10T00:00:00.000Z",
      passCount: 842,
    },
    {
      id: "badge-4",
      code: "04D9A0F5",
      status: "ACTIVE",
      employee: { id: "employee-4", name: "Rodrigo Bastos" },
      department: "Logística",
      linkedAt: "2023-01-20T00:00:00.000Z",
      passCount: 512,
    },
    {
      id: "badge-5",
      code: "04E1B7C0",
      status: "ACTIVE",
      employee: { id: "employee-6", name: "Juliana Prado" },
      department: "Financeiro",
      linkedAt: "2018-08-03T00:00:00.000Z",
      passCount: 2104,
    },
    {
      id: "badge-6",
      code: "04FA0033",
      status: "BLOCKED",
      employee: { id: "employee-1", name: "Ana Carolina Souza" },
      department: "Operações",
      linkedAt: "2023-05-12T00:00:00.000Z",
      passCount: 240,
    },
    {
      id: "badge-7",
      code: "04FF0010",
      status: "UNASSIGNED",
      employee: null,
      department: null,
      linkedAt: null,
      passCount: 0,
    },
    {
      id: "badge-8",
      code: "04FF0011",
      status: "UNASSIGNED",
      employee: null,
      department: null,
      linkedAt: null,
      passCount: 0,
    },
  ],
  schedules: [
    {
      id: "schedule-1",
      name: "Administrativo 44h",
      weeklyHours: 44,
      employeeCount: 4,
      shiftType: "FIXED",
    },
    {
      id: "schedule-2",
      name: "Operacional 12x36",
      weeklyHours: 36,
      employeeCount: 1,
      shiftType: "ROTATING",
    },
    {
      id: "schedule-3",
      name: "Portaria 12x36",
      weeklyHours: 36,
      employeeCount: 0,
      shiftType: "ROTATING",
    },
  ],
  absences: [
    {
      id: "absence-1",
      employee: {
        id: "employee-5",
        name: "Beatriz Moura",
        registration: "20210009845",
      },
      type: { id: "type-vacation", name: "Férias" },
      startDate: "2026-07-14",
      endDate: "2026-08-03",
      days: 21,
      status: "ACTIVE",
    },
    {
      id: "absence-2",
      employee: {
        id: "employee-2",
        name: "Marcos Ferreira",
        registration: "20190014522",
      },
      type: { id: "type-medical", name: "Atestado médico" },
      startDate: "2026-08-04",
      endDate: "2026-08-06",
      days: 3,
      status: "ACTIVE",
    },
    {
      id: "absence-3",
      employee: {
        id: "employee-1",
        name: "Ana Carolina Souza",
        registration: "20220023770",
      },
      type: { id: "type-leave", name: "Folga compensada" },
      startDate: "2026-09-01",
      endDate: "2026-09-01",
      days: 1,
      status: "SCHEDULED",
    },
  ],
  auditLogs: [
    {
      id: "audit-1",
      occurredAt: isoSecondsAgo(3600),
      actor: {
        id: "user-1",
        name: "Owner User",
        email: "owner@batente.dev",
      },
      action: "user.create",
      resource: "Usuários",
      summary: "Criou portaria@construtoravale.com.br (OPERADOR)",
    },
    {
      id: "audit-2",
      occurredAt: isoSecondsAgo(7200),
      actor: {
        id: "user-3",
        name: "Marina Vale",
        email: "rh@construtoravale.com.br",
      },
      action: "employee.update",
      resource: "Colaboradores",
      summary: "Alterou departamento de Rodrigo Bastos",
    },
    {
      id: "audit-3",
      occurredAt: isoSecondsAgo(86400),
      actor: {
        id: "user-1",
        name: "Owner User",
        email: "owner@batente.dev",
      },
      action: "closure.run",
      resource: "Fechamento",
      summary: "175 espelhos consolidados",
    },
    {
      id: "audit-4",
      occurredAt: isoSecondsAgo(172800),
      actor: {
        id: "user-1",
        name: "Owner User",
        email: "owner@batente.dev",
      },
      action: "badge.block",
      resource: "Crachás",
      summary: "Bloqueou crachá 04FA0033 — perda reportada na portaria",
    },
  ],
  gateQueue: [
    {
      id: "gate-1",
      occurredAt: isoSecondsAgo(4, 118),
      employeeName: "Ana Carolina Souza",
    },
    {
      id: "gate-2",
      occurredAt: isoSecondsAgo(25, 402),
      employeeName: "Marcos Ferreira",
    },
    {
      id: "gate-3",
      occurredAt: isoSecondsAgo(332, 55),
      employeeName: "Beatriz Moura",
    },
    {
      id: "gate-4",
      occurredAt: isoSecondsAgo(713, 903),
      employeeName: "Rodrigo Bastos",
    },
  ],
  gateCredentials: [
    {
      id: "cred-1",
      code: "04A2B3C4",
      employeeName: "Ana Carolina Souza",
      status: "ACTIVE",
    },
    {
      id: "cred-2",
      code: "04B7C1D9",
      employeeName: "Marcos Ferreira",
      status: "ACTIVE",
    },
    {
      id: "cred-3",
      code: "04FA0033",
      employeeName: "Ana Carolina Souza",
      status: "BLOCKED",
    },
  ],
  settings: [
    {
      key: "company.name",
      label: "Razão social",
      value: "Construtora Vale S.A.",
      category: "Empresa",
    },
    {
      key: "company.cnpj",
      label: "CNPJ",
      value: "12.345.678/0001-90",
      category: "Empresa",
    },
    {
      key: "timekeeping.period",
      label: "Período de ponto aberto",
      value: "Agosto/2026",
      category: "Ponto",
    },
    {
      key: "device.doorOpenMs",
      label: "Tempo de acionamento da trava",
      value: "3000 ms",
      category: "Totem",
    },
    {
      key: "device.badgeListVersion",
      label: "Versão da lista de crachás",
      value: "1842",
      category: "Totem",
    },
    {
      key: "security.sessionTimeout",
      label: "Expiração de sessão",
      value: "8 horas",
      category: "Segurança",
    },
  ],
  panelUsers: [
    {
      id: "user-1",
      email: "owner@batente.dev",
      name: "Owner User",
      role: "ADMIN",
      lastLoginAt: isoSecondsAgo(120),
    },
    {
      id: "user-2",
      email: "viewer@batente.dev",
      name: "Viewer User",
      role: "OPERADOR",
      lastLoginAt: isoSecondsAgo(3600),
    },
    {
      id: "user-3",
      email: "rh@construtoravale.com.br",
      name: "Marina Vale",
      role: "RH",
      lastLoginAt: isoSecondsAgo(7200),
    },
  ],
  timesheetMirrors: [
    {
      id: "mirror-1",
      employee: {
        id: "employee-1",
        name: "Ana Carolina Souza",
        registration: "20220023770",
        department: "Operações",
      },
      month: "2026-08",
      status: "OPEN",
      workedHours: "32:40",
      balanceHours: "+02:15",
    },
    {
      id: "mirror-2",
      employee: {
        id: "employee-2",
        name: "Marcos Ferreira",
        registration: "20190014522",
        department: "Manutenção",
      },
      month: "2026-08",
      status: "PENDING",
      workedHours: "28:00",
      balanceHours: "-04:00",
    },
    {
      id: "mirror-3",
      employee: {
        id: "employee-4",
        name: "Rodrigo Bastos",
        registration: "20230031190",
        department: "Logística",
      },
      month: "2026-07",
      status: "CONSOLIDATED",
      workedHours: "176:00",
      balanceHours: "+08:30",
    },
    {
      id: "mirror-4",
      employee: {
        id: "employee-6",
        name: "Juliana Prado",
        registration: "20180007311",
        department: "Financeiro",
      },
      month: "2026-07",
      status: "CONSOLIDATED",
      workedHours: "176:00",
      balanceHours: "+00:00",
    },
  ],
  accessEvents: ACCESS_SEEDS.map(toAccessEvent),
  accessStats: { total: 148, granted: 142, denied: 6, offline: 11 },
  pendingSummary: { days: 7, blockingClosure: 4, periodLabel: "julho" },
  adjustmentSummary: { count: 3, oldestWaitingDays: 2 },
};

/** Batimento do totem recalculado a cada leitura — ele está vivo agora. */
export function readPrimaryDevice(): Device {
  const device = mockDb.devices[0] ?? PRIMARY_DEVICE;
  return { ...device, lastContactAt: new Date(Date.now() - 4000).toISOString() };
}

export function findAccessEventById(id: string): AccessEvent | undefined {
  return mockDb.accessEvents.find((event) => event.id === id);
}

export function generateId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function findUserByEmail(email: string): MockUserRecord | undefined {
  const normalized = normalizeEmail(email);
  return mockDb.users.find((user) => normalizeEmail(user.email) === normalized);
}

export function findUserByToken(token: string | null): User | undefined {
  if (!token) return undefined;
  const userId = mockDb.sessions[token];
  if (!userId) return undefined;
  const user = mockDb.users.find((entry) => entry.id === userId);
  if (!user) return undefined;
  const { password: _, ...safeUser } = user;
  return safeUser;
}

export function createSession(userId: string): string {
  const token = generateId("token");
  mockDb.sessions[token] = userId;
  return token;
}

export function revokeSession(token: string): void {
  delete mockDb.sessions[token];
}

/** Simula indisponibilidade de infra sem depender de rede real. */
export function simulatesOutage(email: string): boolean {
  return normalizeEmail(email).startsWith(OUTAGE_EMAIL_PREFIX);
}

function emptyAttemptRecord(): LoginAttemptRecord {
  return { failedAttempts: 0, lockedAt: null, unlockAt: null };
}

export function getLoginAttempt(email: string): LoginAttemptRecord {
  return mockDb.loginAttempts[normalizeEmail(email)] ?? emptyAttemptRecord();
}

export function isLockActive(
  record: LoginAttemptRecord,
  reference: number = Date.now(),
): boolean {
  if (!record.unlockAt) return false;
  return new Date(record.unlockAt).getTime() > reference;
}

export function clearLoginAttempts(email: string): void {
  delete mockDb.loginAttempts[normalizeEmail(email)];
}

/**
 * Registra uma falha e aplica o bloqueio ao atingir `MAX_LOGIN_ATTEMPTS`.
 * Chamado também para e-mails inexistentes, para que a resposta seja idêntica.
 */
export function registerFailedLogin(email: string): LoginAttemptRecord {
  const key = normalizeEmail(email);
  const current = mockDb.loginAttempts[key] ?? emptyAttemptRecord();
  const failedAttempts = current.failedAttempts + 1;

  const record: LoginAttemptRecord =
    failedAttempts >= MAX_LOGIN_ATTEMPTS
      ? {
          failedAttempts,
          lockedAt: new Date().toISOString(),
          unlockAt: new Date(Date.now() + LOCKOUT_MS).toISOString(),
        }
      : { failedAttempts, lockedAt: null, unlockAt: null };

  mockDb.loginAttempts[key] = record;
  return record;
}
