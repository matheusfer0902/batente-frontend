/**
 * Guarda em memória o token CSRF.
 *
 * O backend está em outro domínio, então o padrão clássico de double-submit
 * (ler o cookie por JavaScript e repetir o valor no header) **não funciona**:
 * `document.cookie` só enxerga cookies da própria origem. Em vez disso o
 * servidor guarda o segredo num cookie `HttpOnly` e devolve o HMAC dele no
 * corpo de `GET /auth/csrf`; este módulo guarda esse HMAC e o cliente HTTP o
 * ecoa em `x-csrf-token`.
 *
 * Isto **não** contradiz "nenhum token acessível por JavaScript": o token CSRF
 * não autentica ninguém. Sozinho ele não abre sessão — só prova que a
 * requisição partiu de código que conseguiu ler a resposta de `/auth/csrf`,
 * o que um site hostil não consegue por causa da allowlist de CORS.
 *
 * Fora do Redux de propósito: não é estado de interface, ninguém renderiza a
 * partir dele, e o interceptor precisa lê-lo fora do ciclo do React.
 */
const CSRF_ENDPOINT = "/auth/csrf";

let csrfToken: string | null = null;
/** Deduplica buscas concorrentes — várias requisições podem faltar o token ao mesmo tempo. */
let emVoo: Promise<string | null> | null = null;

export function getCsrfToken(): string | null {
  return csrfToken;
}

export function setCsrfToken(token: string | null): void {
  csrfToken = token;
}

/** Descarta o token — usado no logout e quando o servidor recusa o atual. */
export function clearCsrfToken(): void {
  csrfToken = null;
  emVoo = null;
}

/**
 * Busca o token, reaproveitando uma busca em andamento.
 *
 * `credentials: "include"` é obrigatório: é esta resposta que grava o cookie
 * `csrf_secret`, e sem ele o par segredo/token nunca casa.
 */
export async function ensureCsrfToken(apiBaseUrl: string): Promise<string | null> {
  if (csrfToken) return csrfToken;
  if (emVoo) return emVoo;

  emVoo = (async () => {
    try {
      const response = await fetch(`${apiBaseUrl}${CSRF_ENDPOINT}`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) return null;

      const data: unknown = await response.json();
      const token =
        typeof data === "object" &&
        data !== null &&
        "csrfToken" in data &&
        typeof (data as { csrfToken: unknown }).csrfToken === "string"
          ? (data as { csrfToken: string }).csrfToken
          : null;

      csrfToken = token;
      return token;
    } catch {
      // Rede fora: quem chamou trata como indisponibilidade.
      return null;
    } finally {
      emVoo = null;
    }
  })();

  return emVoo;
}
