import type { ApiErrorDetailValue } from "@/types/api";
import {
  LOGIN_ATTEMPTS_HINT_THRESHOLD,
  MAX_LOGIN_ATTEMPTS,
  loginErrorCodes,
  userRoles,
  type LoginErrorCode,
  type LoginFailure,
  type UserRole,
} from "@/types/auth";

/** Destino após o login, por papel (nota de implementação do Bloco 1). */
const LANDING_ROUTES: Record<UserRole, string> = {
  ADMIN: "/inicio",
  RH: "/inicio",
  OPERADOR: "/portaria",
};

const FALLBACK_ROUTE = "/login";
/** Destino de quem tem sessão mas cujo papel não pôde ser lido. */
const DEFAULT_AUTHENTICATED_ROUTE = "/inicio";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readNumber(
  source: Record<string, unknown> | null,
  key: string,
): number | null {
  const value = source?.[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function readString(
  source: Record<string, unknown> | null,
  key: string,
): string | null {
  const value = source?.[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function isLoginErrorCode(value: unknown): value is LoginErrorCode {
  return (
    typeof value === "string" &&
    (loginErrorCodes as readonly string[]).includes(value)
  );
}

function codeFromStatus(status: number | string | null): LoginErrorCode {
  if (status === 401 || status === 403) return "invalid_credentials";
  if (status === 423 || status === 429) return "account_locked";
  if (
    status === 0 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    status === "FETCH_ERROR" ||
    status === "TIMEOUT_ERROR"
  ) {
    return "server_unavailable";
  }
  return "unknown";
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export class AuthService {
  static isUserRole(value: unknown): value is UserRole {
    return (
      typeof value === "string" &&
      (userRoles as readonly string[]).includes(value)
    );
  }

  static resolveLandingRoute(role: UserRole | null | undefined): string {
    if (!role) return FALLBACK_ROUTE;
    return LANDING_ROUTES[role] ?? FALLBACK_ROUTE;
  }

  /**
   * Destino de uma sessão já confirmada, a partir de um papel não confiável
   * (cookie). Nunca devolve `/login` — isso criaria laço de redirecionamento.
   */
  static resolveAuthenticatedRoute(roleValue: unknown): string {
    return AuthService.isUserRole(roleValue)
      ? AuthService.resolveLandingRoute(roleValue)
      : DEFAULT_AUTHENTICATED_ROUTE;
  }

  static get landingRoutes(): readonly string[] {
    return Array.from(new Set(Object.values(LANDING_ROUTES)));
  }

  /**
   * Normaliza o erro cru do RTK Query (mock hoje, HTTP amanhã) em um contrato
   * estável de UI. O texto vem do i18n a partir de `code` — nunca de `message`.
   */
  static parseLoginFailure(error: unknown): LoginFailure {
    const failure: LoginFailure = {
      code: "unknown",
      failedAttempts: 0,
      remainingAttempts: MAX_LOGIN_ATTEMPTS,
      lockedAt: null,
      unlockAt: null,
      occurredAt: null,
      status: null,
    };

    if (!isRecord(error)) return failure;

    const rawStatus = error.status;
    const status =
      typeof rawStatus === "number" || typeof rawStatus === "string"
        ? rawStatus
        : null;
    const data = isRecord(error.data) ? error.data : null;
    const details = isRecord(data?.details)
      ? (data.details as Record<string, ApiErrorDetailValue>)
      : null;

    const code = isLoginErrorCode(data?.code)
      ? data.code
      : codeFromStatus(status);

    const failedAttempts = readNumber(details, "failedAttempts") ?? 0;
    const remainingAttempts =
      readNumber(details, "remainingAttempts") ??
      Math.max(MAX_LOGIN_ATTEMPTS - failedAttempts, 0);

    return {
      code,
      failedAttempts,
      remainingAttempts,
      lockedAt: readString(details, "lockedAt"),
      unlockAt: readString(details, "unlockAt"),
      occurredAt: readString(details, "occurredAt"),
      status: typeof status === "number" ? status : null,
    };
  }

  /** O contador de tentativas restantes só aparece a partir da terceira falha. */
  static shouldShowRemainingAttempts(failure: LoginFailure | null): boolean {
    if (!failure || failure.code !== "invalid_credentials") return false;
    return (
      failure.failedAttempts >= LOGIN_ATTEMPTS_HINT_THRESHOLD &&
      failure.remainingAttempts > 0
    );
  }

  /** Bloqueio ainda vigente na referência informada. */
  static isLockActive(failure: LoginFailure | null, reference: number): boolean {
    if (!failure || failure.code !== "account_locked" || !failure.unlockAt) {
      return false;
    }
    return new Date(failure.unlockAt).getTime() > reference;
  }

  /** Milissegundos restantes até a liberação automática. */
  static millisecondsUntilUnlock(
    failure: LoginFailure | null,
    reference: number,
  ): number {
    if (!failure?.unlockAt) return 0;
    return Math.max(new Date(failure.unlockAt).getTime() - reference, 0);
  }

  /** `mm:ss` a partir de milissegundos restantes. */
  static formatCountdown(milliseconds: number): string {
    const totalSeconds = Math.max(Math.ceil(milliseconds / 1000), 0);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${pad(minutes)}:${pad(seconds)}`;
  }

  /** Fração 0–1 do bloqueio já decorrida — alimenta a barra de progresso. */
  static lockoutProgress(failure: LoginFailure | null, reference: number): number {
    if (!failure?.lockedAt || !failure.unlockAt) return 0;
    const start = new Date(failure.lockedAt).getTime();
    const end = new Date(failure.unlockAt).getTime();
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      return 0;
    }
    const elapsed = (reference - start) / (end - start);
    return Math.min(Math.max(elapsed, 0), 1);
  }

  /** `HH:MM:SS` no fuso do cliente, para o diagnóstico de indisponibilidade. */
  static formatTimeOfDay(isoDate: string | null): string | null {
    if (!isoDate) return null;
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return null;
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }
}
