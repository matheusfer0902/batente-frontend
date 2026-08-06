/**
 * Prefixos de rota da API. Usados pelo cutover (`hybridBaseQuery`) e pela
 * documentação em `docs/api-integration.md`.
 *
 * Enums de domínio ficam nos respectivos `types/` — este arquivo só roteia.
 */

/** Sempre no backend real (cookies + CSRF). */
export const API_ROUTES_AUTH = ["/auth", "/users"] as const;

/** Domínios com UI pronta — habilitar via `NEXT_PUBLIC_REAL_API_PREFIXES`. */
export const API_ROUTES_PANEL = [
  "/access-events",
  "/devices",
  "/timekeeping",
] as const;

/** Cadastros e operação — mock até o backend expor o contrato. */
export const API_ROUTES_DOMAIN = [
  "/departments",
  "/employees",
  "/badges",
  "/schedules",
  "/absences",
  "/audit-logs",
  "/gate",
  "/settings",
] as const;

export type ApiRoutePrefix =
  | (typeof API_ROUTES_AUTH)[number]
  | (typeof API_ROUTES_PANEL)[number]
  | (typeof API_ROUTES_DOMAIN)[number];

/** Prefixos adicionais vindos do env (vírgula). Ex.: `/access-events,/devices` */
export function parseRealApiPrefixes(): readonly string[] {
  const fromEnv = process.env.NEXT_PUBLIC_REAL_API_PREFIXES?.trim();
  if (!fromEnv) return [];
  return fromEnv
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Prefixos que usam `authBaseQuery` (backend real) nesta build. */
export function resolveRealApiPrefixes(): readonly string[] {
  return [...API_ROUTES_AUTH, ...parseRealApiPrefixes()];
}
