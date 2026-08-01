import { http } from "msw";
import type { AuthCredentials, AuthResponse, RegisterPayload } from "@/types/auth";
import { MAX_LOGIN_ATTEMPTS } from "@/types/auth";
import { API_BASE_URL } from "@/redux/reducers/queries/fetchBaseQuery";
import {
  clearLoginAttempts,
  createSession,
  findUserByEmail,
  findUserByToken,
  generateId,
  getLoginAttempt,
  isLockActive,
  registerFailedLogin,
  revokeSession,
  simulatesOutage,
  testDb,
} from "../db";
import { extractBearerToken, jsonError, unavailableResponse } from "../utils";

const base = API_BASE_URL;

function sanitizeUser(user: (typeof testDb.users)[number]) {
  const { password: _, ...safeUser } = user;
  return safeUser;
}

function lockedError(record: ReturnType<typeof getLoginAttempt>) {
  return jsonError(423, "Account temporarily locked", "account_locked", {
    failedAttempts: record.failedAttempts,
    remainingAttempts: 0,
    lockedAt: record.lockedAt,
    unlockAt: record.unlockAt,
    occurredAt: new Date().toISOString(),
  });
}

export const authHandlers = [
  http.get(`${base}/auth/me`, ({ request }) => {
    if (testDb.serverUnavailable) return unavailableResponse();
    const user = findUserByToken(extractBearerToken(request));
    if (!user) return jsonError(401, "Unauthorized");
    return Response.json(user);
  }),

  http.post(`${base}/auth/logout`, ({ request }) => {
    if (testDb.serverUnavailable) return unavailableResponse();
    const token = extractBearerToken(request);
    if (token) revokeSession(token);
    return Response.json({ success: true });
  }),

  http.post(`${base}/auth/login`, async ({ request }) => {
    if (testDb.serverUnavailable) return unavailableResponse();
    const credentials = (await request.json()) as AuthCredentials;

    if (simulatesOutage(credentials.email)) {
      return jsonError(503, "Service unavailable", "server_unavailable", {
        occurredAt: new Date().toISOString(),
      });
    }

    const attempt = getLoginAttempt(credentials.email);
    if (isLockActive(attempt)) {
      return lockedError(attempt);
    }
    if (attempt.unlockAt) {
      clearLoginAttempts(credentials.email);
    }

    const user = findUserByEmail(credentials.email);
    if (!user || user.password !== credentials.password) {
      const record = registerFailedLogin(credentials.email);
      if (isLockActive(record)) {
        return lockedError(record);
      }
      return jsonError(401, "Invalid credentials", "invalid_credentials", {
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
    return Response.json(response);
  }),

  http.post(`${base}/auth/register`, async ({ request }) => {
    if (testDb.serverUnavailable) return unavailableResponse();
    const payload = (await request.json()) as RegisterPayload;
    if (findUserByEmail(payload.email)) {
      return jsonError(409, "Email already registered");
    }
    const newUser = {
      id: generateId("user"),
      email: payload.email,
      name: payload.name,
      role: "OPERADOR" as const,
      password: payload.password,
    };
    testDb.users.push(newUser);
    const token = createSession(newUser.id);
    const response: AuthResponse = { user: sanitizeUser(newUser), token };
    return Response.json(response);
  }),
];
