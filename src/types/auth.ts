export const userRoles = ["ADMIN", "RH", "OPERADOR"] as const;
export type UserRole = (typeof userRoles)[number];

/** Falhas seguidas antes do bloqueio temporário. */
export const MAX_LOGIN_ATTEMPTS = 5;
/** Contador de tentativas restantes só aparece a partir desta falha. */
export const LOGIN_ATTEMPTS_HINT_THRESHOLD = 3;
/** Duração do bloqueio temporário, em minutos. */
export const LOGIN_LOCKOUT_MINUTES = 15;

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

/** Permissões que o servidor resolve a partir do papel — só para UX. */
export const permissions = ["user:create", "user:read"] as const;
export type Permission = (typeof permissions)[number];

/**
 * Resposta de `GET /auth/me` — a **única** fonte de verdade de sessão.
 *
 * O frontend nunca decodifica token para descobrir quem está logado: o token
 * está em cookie `HttpOnly` e é ilegível por JavaScript. `userId` (e não `id`)
 * espelha o contrato do backend.
 */
export interface SessionUser {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: readonly Permission[];
}

/** Adapta o contrato de `/auth/me` ao `User` que os componentes já consomem. */
export function toUser(session: SessionUser): User {
  return {
    id: session.userId,
    email: session.email,
    name: session.name,
    role: session.role,
  };
}

export interface AuthCredentials {
  email: string;
  password: string;
}

/** Corpo de `POST /users` — criação por administrador, não auto-registro. */
export interface CreateUserPayload {
  email: string;
  name: string;
  password: string;
  role: UserRole;
}

/**
 * Motivos de falha no login. `invalid_credentials` cobre tanto senha incorreta
 * quanto e-mail inexistente — a resposta nunca revela qual dos dois ocorreu.
 */
export const loginErrorCodes = [
  "invalid_credentials",
  "account_locked",
  "server_unavailable",
  "unknown",
] as const;
export type LoginErrorCode = (typeof loginErrorCodes)[number];

export interface LoginFailure {
  code: LoginErrorCode;
  /** Falhas seguidas registradas para este e-mail. */
  failedAttempts: number;
  /** Tentativas restantes antes do bloqueio. */
  remainingAttempts: number;
  /** ISO — início do bloqueio (base da barra de progresso). */
  lockedAt: string | null;
  /** ISO — momento em que o acesso é liberado automaticamente. */
  unlockAt: string | null;
  /** ISO — horário da tentativa, exibido no diagnóstico de indisponibilidade. */
  occurredAt: string | null;
  /** Status HTTP original, exibido no diagnóstico de indisponibilidade. */
  status: number | null;
}
