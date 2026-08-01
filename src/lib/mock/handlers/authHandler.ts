import type { AuthCredentials, AuthResponse, RegisterPayload } from "@/types/auth";
import { MAX_LOGIN_ATTEMPTS } from "@/types/auth";
import type { ApiError } from "@/types/api";
import {
  clearLoginAttempts,
  createSession,
  findUserByEmail,
  findUserByToken,
  generateId,
  getLoginAttempt,
  isLockActive,
  mockDb,
  registerFailedLogin,
  revokeSession,
  simulatesOutage,
  type LoginAttemptRecord,
} from "@/lib/mock/mockDb";
import {
  error,
  getTokenFromState,
  notFound,
  type HandlerResult,
  type MockRequest,
} from "@/lib/mock/handlers/shared";

function lockedError(record: LoginAttemptRecord): { error: ApiError } {
  return error(423, "Account temporarily locked", "account_locked", {
    failedAttempts: record.failedAttempts,
    remainingAttempts: 0,
    lockedAt: record.lockedAt,
    unlockAt: record.unlockAt,
    occurredAt: new Date().toISOString(),
  });
}

function sanitizeUser(user: (typeof mockDb.users)[number]) {
  const { password: _, ...safeUser } = user;
  return safeUser;
}

export function handleAuthRoute({
  path,
  method,
  body,
  state,
}: MockRequest): HandlerResult {
  if (path === "/auth/me" && method === "GET") {
    const user = findUserByToken(getTokenFromState(state));
    if (!user) return error(401, "Unauthorized");
    return { data: user };
  }

  if (path === "/auth/logout" && method === "POST") {
    const token = getTokenFromState(state);
    if (token) revokeSession(token);
    return { data: { success: true } };
  }

  if (path === "/auth/login" && method === "POST") {
    const credentials = body as AuthCredentials;

    // 1e — infra indisponível: nada é contado como tentativa.
    if (simulatesOutage(credentials.email)) {
      return error(503, "Service unavailable", "server_unavailable", {
        occurredAt: new Date().toISOString(),
      });
    }

    // 1d — bloqueio ainda vigente: nem chega a validar a senha.
    const attempt = getLoginAttempt(credentials.email);
    if (isLockActive(attempt)) {
      return lockedError(attempt);
    }
    if (attempt.unlockAt) {
      clearLoginAttempts(credentials.email);
    }

    // 1c — senha incorreta e e-mail inexistente seguem exatamente o mesmo caminho.
    const user = findUserByEmail(credentials.email);
    if (!user || user.password !== credentials.password) {
      const record = registerFailedLogin(credentials.email);
      if (isLockActive(record)) {
        return lockedError(record);
      }
      return error(401, "Invalid credentials", "invalid_credentials", {
        failedAttempts: record.failedAttempts,
        remainingAttempts: Math.max(
          MAX_LOGIN_ATTEMPTS - record.failedAttempts,
          0,
        ),
        occurredAt: new Date().toISOString(),
      });
    }

    clearLoginAttempts(credentials.email);
    const token = createSession(user.id);
    const response: AuthResponse = { user: sanitizeUser(user), token };
    return { data: response };
  }

  if (path === "/auth/register" && method === "POST") {
    const payload = body as RegisterPayload;
    if (findUserByEmail(payload.email)) {
      return error(409, "Email already registered");
    }
    const newUser = {
      id: generateId("user"),
      email: payload.email,
      name: payload.name,
      role: "OPERADOR" as const,
      password: payload.password,
    };
    mockDb.users.push(newUser);
    const token = createSession(newUser.id);
    const response: AuthResponse = { user: sanitizeUser(newUser), token };
    return { data: response };
  }

  return notFound();
}
