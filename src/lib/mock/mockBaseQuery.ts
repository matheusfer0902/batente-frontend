import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { ApiErrorDetailValue, MockRequestArgs, ApiError } from "@/types/api";
import type {
  AuthCredentials,
  AuthResponse,
  RegisterPayload,
} from "@/types/auth";
import { MAX_LOGIN_ATTEMPTS } from "@/types/auth";
import type {
  CreateResourcePayload,
  Resource,
  UpdateResourcePayload,
} from "@/types/resource";
import type { RootState } from "@/redux/store";
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

const MOCK_LATENCY_MS = 200;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function error(
  status: number,
  message: string,
  code?: string,
  details?: Record<string, ApiErrorDetailValue>,
): { error: ApiError } {
  return { error: { status, data: { message, code, details } } };
}

function lockedError(record: LoginAttemptRecord): { error: ApiError } {
  return error(423, "Account temporarily locked", "account_locked", {
    failedAttempts: record.failedAttempts,
    remainingAttempts: 0,
    lockedAt: record.lockedAt,
    unlockAt: record.unlockAt,
    occurredAt: new Date().toISOString(),
  });
}

function getTokenFromState(state: RootState): string | null {
  return state.auth.token;
}

function requireAuth(state: RootState): UserOrError {
  const token = getTokenFromState(state);
  const user = findUserByToken(token);
  if (!user || !token) {
    return { error: error(401, "Unauthorized") };
  }
  return { user, token };
}

type UserOrError =
  | { user: NonNullable<ReturnType<typeof findUserByToken>>; token: string }
  | { error: { error: ApiError } };

function sanitizeUser(user: (typeof mockDb.users)[number]) {
  const { password: _, ...safeUser } = user;
  return safeUser;
}

async function handleAuthRoute(
  url: string,
  method: string,
  body: unknown,
): Promise<{ data: unknown } | { error: ApiError }> {
  if (url === "/auth/login" && method === "POST") {
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

  if (url === "/auth/register" && method === "POST") {
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

  return error(404, "Route not found");
}

async function handleResourceRoute(
  url: string,
  method: string,
  body: unknown,
  state: RootState,
): Promise<{ data: unknown } | { error: ApiError }> {
  const authResult = requireAuth(state);
  if ("error" in authResult) {
    return authResult.error;
  }

  const resourceMatch = url.match(/^\/resources(?:\/([^/]+))?$/);
  if (!resourceMatch) {
    return error(404, "Route not found");
  }

  const resourceId = resourceMatch[1];

  if (method === "GET" && !resourceId) {
    return { data: mockDb.resources };
  }

  if (method === "GET" && resourceId) {
    const resource = mockDb.resources.find((item) => item.id === resourceId);
    if (!resource) return error(404, "Resource not found");
    return { data: resource };
  }

  if (method === "POST" && !resourceId) {
    const payload = body as CreateResourcePayload;
    const timestamp = new Date().toISOString();
    const resource: Resource = {
      id: generateId("resource"),
      title: payload.title,
      description: payload.description,
      ownerId: authResult.user.id,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    mockDb.resources.unshift(resource);
    return { data: resource };
  }

  if (method === "PUT" && resourceId) {
    const payload = body as UpdateResourcePayload;
    const index = mockDb.resources.findIndex((item) => item.id === resourceId);
    if (index === -1) return error(404, "Resource not found");
    const existing = mockDb.resources[index]!;
    if (existing.ownerId !== authResult.user.id) {
      return error(403, "Forbidden");
    }
    const updated: Resource = {
      ...existing,
      title: payload.title ?? existing.title,
      description: payload.description ?? existing.description,
      updatedAt: new Date().toISOString(),
    };
    mockDb.resources[index] = updated;
    return { data: updated };
  }

  if (method === "DELETE" && resourceId) {
    const index = mockDb.resources.findIndex((item) => item.id === resourceId);
    if (index === -1) return error(404, "Resource not found");
    const existing = mockDb.resources[index]!;
    if (existing.ownerId !== authResult.user.id) {
      return error(403, "Forbidden");
    }
    mockDb.resources.splice(index, 1);
    return { data: { id: resourceId } };
  }

  return error(404, "Route not found");
}

export const mockBaseQuery: BaseQueryFn<
  MockRequestArgs,
  unknown,
  ApiError
> = async ({ url, method = "GET", body }, api) => {
  await delay(MOCK_LATENCY_MS);

  const state = api.getState() as RootState;

  if (url.startsWith("/auth")) {
    if (url === "/auth/me" && method === "GET") {
      const token = getTokenFromState(state);
      const user = findUserByToken(token);
      if (!user) return error(401, "Unauthorized");
      return { data: user };
    }

    if (url === "/auth/logout" && method === "POST") {
      const token = getTokenFromState(state);
      if (token) revokeSession(token);
      return { data: { success: true } };
    }

    const result = await handleAuthRoute(url, method, body);
    if ("error" in result) {
      return result;
    }
    return result;
  }

  if (url.startsWith("/resources")) {
    const result = await handleResourceRoute(url, method, body, state);
    if ("error" in result) {
      return result;
    }
    return result;
  }

  return error(404, "Route not found");
};
