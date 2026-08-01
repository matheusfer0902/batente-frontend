import type { Resource } from "@/types/resource";
import type { User } from "@/types/auth";
import { LOGIN_LOCKOUT_MINUTES, MAX_LOGIN_ATTEMPTS } from "@/types/auth";

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
}

const now = new Date().toISOString();

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
};

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
