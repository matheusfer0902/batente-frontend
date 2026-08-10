/**
 * Prefixos de rota da API. Usados pelo cutover (`hybridBaseQuery`) e pela
 * documentação em `docs/api-integration.md`.
 *
 * Enums de domínio ficam nos respectivos `types/` — este arquivo só roteia.
 */

/** Sempre no backend real (cookies + CSRF). */
export const API_ROUTES_AUTH = ["/auth", "/users"] as const;

/**
 * Domínios com backend real e escrita — habilitar via cutover.
 *
 * `/timekeeping` entrou aqui: o backend passou a servir `mirror`, `pending` e
 * `adjustments`, e `TimekeepingSummaryReturn` espelha os tipos de
 * `types/timekeeping.ts` campo por campo. Antes só existia `mirror`, e ligar o
 * prefixo fazia os blocos do Início responderem 404.
 */
export const API_ROUTES_PANEL = [
  "/access-events",
  "/devices",
  "/departments",
  "/employees",
  "/schedules",
  "/absences",
  "/timekeeping",
] as const;

/**
 * Backend real, mas **somente leitura** — o painel lista e não escreve.
 *
 * Ligar o cutover destes não quebra tela nenhuma, porque nenhuma delas tem
 * mutation. Quando a escrita chegar, cada um sai desta lista para a de cima.
 */
export const API_ROUTES_DOMAIN = [
  "/badges",
  "/audit-logs",
  "/gate",
  "/settings",
] as const;

/** Todas as rotas de painel fora `/auth` e POST-only em `/users`. */
export const API_ROUTES_CUTOVER = [
  ...API_ROUTES_PANEL,
  ...API_ROUTES_DOMAIN,
] as const;

export type ApiRoutePrefix =
  | (typeof API_ROUTES_AUTH)[number]
  | (typeof API_ROUTES_PANEL)[number]
  | (typeof API_ROUTES_DOMAIN)[number];

/** Prefixos adicionais vindos do env (vírgula). Ex.: `/access-events,/devices` */
export function parseRealApiPrefixes(): readonly string[] {
  const fromEnv = process.env.NEXT_PUBLIC_REAL_API_PREFIXES?.trim();
  if (!fromEnv) return [];
  if (fromEnv.toLowerCase() === "all") {
    return [...API_ROUTES_CUTOVER];
  }
  return fromEnv
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
}

function usesFullCutover(): boolean {
  const mode = process.env.NEXT_PUBLIC_API_MODE?.trim().toLowerCase();
  return mode === "real";
}

/** Prefixos que permanecem no mock mesmo com `API_MODE=real` (backend pendente). */
export function parseMockOverridePrefixes(): readonly string[] {
  const fromEnv = process.env.NEXT_PUBLIC_MOCK_PREFIXES?.trim();
  if (!fromEnv) return [];
  return fromEnv
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Prefixos que usam `authBaseQuery` (backend real) nesta build. */
export function resolveRealApiPrefixes(): readonly string[] {
  if (usesFullCutover()) {
    return [...API_ROUTES_AUTH, ...API_ROUTES_CUTOVER];
  }

  const partial = parseRealApiPrefixes();
  if (partial.length > 0) {
    return [...API_ROUTES_AUTH, ...partial];
  }

  return [...API_ROUTES_AUTH];
}
