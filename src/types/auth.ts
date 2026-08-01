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

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload extends AuthCredentials {
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
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
