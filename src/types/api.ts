export interface MockRequestArgs {
  url: string;
  method?: string;
  body?: unknown;
}

export type ApiErrorDetailValue = string | number | boolean | null;

export interface ApiErrorData {
  message: string;
  /** Código estável de negócio — a UI decide o texto a partir dele, nunca do `message`. */
  code?: string;
  details?: Record<string, ApiErrorDetailValue>;
}

export interface ApiError {
  status: number;
  data: ApiErrorData;
}

export type TagType =
  | "Auth"
  | "Resource"
  | "Access"
  | "Device"
  | "Timekeeping";

/**
 * Cenários de demonstração do mock. Chegam pela query `?cenario=` da página e
 * viajam até o mock como query string — um backend real ignora o parâmetro.
 */
export const mockScenarios = ["degradado", "offline", "sem-movimento"] as const;
export type MockScenario = (typeof mockScenarios)[number];

export function isMockScenario(value: unknown): value is MockScenario {
  return (
    typeof value === "string" &&
    (mockScenarios as readonly string[]).includes(value)
  );
}

/** Anexa o cenário à URL do mock, quando houver. */
export function withScenario(url: string, scenario?: string): string {
  if (!scenario) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}scenario=${encodeURIComponent(scenario)}`;
}

export const AUTH_TOKEN_COOKIE = "auth-token";
/** Papel do usuário — permite ao edge/middleware resolver o destino pós-login. */
export const AUTH_ROLE_COOKIE = "auth-role";
