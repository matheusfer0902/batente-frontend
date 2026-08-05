import type { ApiError, ApiErrorDetailValue } from "@/types/api";
import type { RootState } from "@/redux/store";
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

export type UserOrError = { user: User } | { error: { error: ApiError } };

/**
 * Autenticação dos domínios que seguem no mock.
 *
 * Deixou de olhar token: o estado do cliente não tem mais nenhum, porque a
 * sessão real vive em cookie `HttpOnly`. O que resta observável é o usuário que
 * o `SessionProvider` hidratou a partir de `GET /auth/me` — e para um mock isso
 * basta, já que ele nunca foi barreira de segurança de verdade.
 *
 * `status` é conferido junto: durante `unknown` a sessão ainda não foi
 * resolvida, e responder 200 aí faria o mock parecer mais permissivo que o
 * backend.
 */
export function requireAuth(state: RootState): UserOrError {
  const { user, status } = state.auth;

  if (!user || status !== "authenticated") {
    return { error: error(401, "Unauthorized") };
  }

  return { user };
}
