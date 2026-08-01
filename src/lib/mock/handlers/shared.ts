import type { ApiError, ApiErrorDetailValue } from "@/types/api";
import type { RootState } from "@/redux/store";
import { findUserByToken } from "@/lib/mock/mockDb";
import type { User } from "@/types/auth";

export type HandlerResult = { data: unknown } | { error: ApiError };

export interface MockRequest {
  /** Caminho sem query string. */
  path: string;
  method: string;
  body: unknown;
  searchParams: URLSearchParams;
  /** Cenário de demonstração vindo de `?scenario=`. */
  scenario: string | null;
  state: RootState;
}

export function error(
  status: number,
  message: string,
  code?: string,
  details?: Record<string, ApiErrorDetailValue>,
): { error: ApiError } {
  return { error: { status, data: { message, code, details } } };
}

export function notFound(): { error: ApiError } {
  return error(404, "Route not found");
}

export function unavailable(): { error: ApiError } {
  return error(503, "Service unavailable", "server_unavailable", {
    occurredAt: new Date().toISOString(),
  });
}

export function getTokenFromState(state: RootState): string | null {
  return state.auth.token;
}

export type UserOrError =
  | { user: User; token: string }
  | { error: { error: ApiError } };

export function requireAuth(state: RootState): UserOrError {
  const token = getTokenFromState(state);
  const user = findUserByToken(token);
  if (!user || !token) {
    return { error: error(401, "Unauthorized") };
  }
  return { user, token };
}
