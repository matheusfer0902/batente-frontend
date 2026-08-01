export interface MockRequestArgs {
  url: string;
  method?: string;
  body?: unknown;
}

export interface ApiError {
  status: number;
  data: { message: string };
}

export type TagType = "Auth" | "Resource";

export const AUTH_TOKEN_COOKIE = "auth-token";
