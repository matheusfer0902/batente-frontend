import type { User } from "@/types/auth";
import { LOGIN_LOCKOUT_MINUTES, MAX_LOGIN_ATTEMPTS } from "@/types/auth";

interface MockUserRecord extends User {
  password: string;
}

export interface LoginAttemptRecord {
  failedAttempts: number;
  lockedAt: string | null;
  unlockAt: string | null;
}

interface TestDatabase {
  users: MockUserRecord[];
  sessions: Record<string, string>;
  loginAttempts: Record<string, LoginAttemptRecord>;
  /** Quando true, todos os endpoints retornam 503. */
  serverUnavailable: boolean;
}

function createInitialDb(): TestDatabase {
  return {
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
    sessions: {},
    loginAttempts: {},
    serverUnavailable: false,
  };
}

/** Estado mutável dos handlers MSW — reiniciado em cada teste. */
export let testDb: TestDatabase = createInitialDb();

export function resetTestDb(): void {
  testDb = createInitialDb();
}

export function generateId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function findUserByEmail(email: string): MockUserRecord | undefined {
  const normalized = normalizeEmail(email);
  return testDb.users.find((user) => normalizeEmail(user.email) === normalized);
}

export function findUserByToken(token: string | null): User | undefined {
  if (!token) return undefined;
  const userId = testDb.sessions[token];
  if (!userId) return undefined;
  const user = testDb.users.find((entry) => entry.id === userId);
  if (!user) return undefined;
  const { password: _, ...safeUser } = user;
  return safeUser;
}

export function createSession(userId: string): string {
  const token = generateId("token");
  testDb.sessions[token] = userId;
  return token;
}

export function revokeSession(token: string): void {
  delete testDb.sessions[token];
}

const OUTAGE_EMAIL_PREFIX = "offline";
const LOCKOUT_MS = LOGIN_LOCKOUT_MINUTES * 60 * 1000;

export function simulatesOutage(email: string): boolean {
  return normalizeEmail(email).startsWith(OUTAGE_EMAIL_PREFIX);
}

function emptyAttemptRecord(): LoginAttemptRecord {
  return { failedAttempts: 0, lockedAt: null, unlockAt: null };
}

export function getLoginAttempt(email: string): LoginAttemptRecord {
  return testDb.loginAttempts[normalizeEmail(email)] ?? emptyAttemptRecord();
}

export function isLockActive(
  record: LoginAttemptRecord,
  reference: number = Date.now(),
): boolean {
  if (!record.unlockAt) return false;
  return new Date(record.unlockAt).getTime() > reference;
}

export function clearLoginAttempts(email: string): void {
  delete testDb.loginAttempts[normalizeEmail(email)];
}

export function registerFailedLogin(email: string): LoginAttemptRecord {
  const key = normalizeEmail(email);
  const current = testDb.loginAttempts[key] ?? emptyAttemptRecord();
  const failedAttempts = current.failedAttempts + 1;

  const record: LoginAttemptRecord =
    failedAttempts >= MAX_LOGIN_ATTEMPTS
      ? {
          failedAttempts,
          lockedAt: new Date().toISOString(),
          unlockAt: new Date(Date.now() + LOCKOUT_MS).toISOString(),
        }
      : { failedAttempts, lockedAt: null, unlockAt: null };

  testDb.loginAttempts[key] = record;
  return record;
}
