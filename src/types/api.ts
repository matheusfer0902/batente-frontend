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

export type TagType = "Auth" | "Resource";

export const AUTH_TOKEN_COOKIE = "auth-token";
/** Papel do usuário — permite ao edge/middleware resolver o destino pós-login. */
export const AUTH_ROLE_COOKIE = "auth-role";
