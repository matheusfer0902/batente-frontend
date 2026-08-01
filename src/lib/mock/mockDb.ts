import type { Resource } from "@/types/resource";
import type { User } from "@/types/auth";
import { LOGIN_LOCKOUT_MINUTES, MAX_LOGIN_ATTEMPTS } from "@/types/auth";
import type { AccessEvent, AccessStats } from "@/types/access";
import type { Device } from "@/types/device";
import type { AdjustmentSummary, PendingSummary } from "@/types/timekeeping";

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
    denialReason: "UNKNOWN_BADGE",
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
