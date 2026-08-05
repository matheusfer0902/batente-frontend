import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { ApiError, ApiErrorData, MockRequestArgs } from "@/types/api";
import { clearCsrfToken, ensureCsrfToken, getCsrfToken } from "@/lib/csrf";

/**
 * Origem da API. Em topologia cross-site o frontend e o backend estão em
 * domínios distintos, então isto **não** pode derivar de `window.location`.
 */
export const AUTH_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

/** Rotas que não devem disparar refresh — evita laço. */
const SEM_REFRESH = ["/auth/login", "/auth/refresh", "/auth/logout", "/auth/csrf"];

const METODOS_SEGUROS = new Set(["GET", "HEAD", "OPTIONS"]);

function isApiErrorData(value: unknown): value is ApiErrorData {
  return (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    typeof (value as ApiErrorData).message === "string"
  );
}

function normalize(error: FetchBaseQueryError): ApiError {
  const status = typeof error.status === "number" ? error.status : 0;
  const data = isApiErrorData(error.data)
    ? error.data
    : { message: "Request failed" };
  return { status, data };
}

/**
 * `credentials: "include"` em toda requisição — é o que faz o navegador enviar
 * os cookies `HttpOnly` de sessão para outro domínio.
 *
 * **Não existe `prepareHeaders` com `Authorization`.** O token não passa por
 * JavaScript em nenhum ponto: quem carrega a sessão é o cookie.
 */
const inner = fetchBaseQuery({
  baseUrl: AUTH_API_BASE_URL,
  credentials: "include",
  prepareHeaders: (headers) => {
    const token = getCsrfToken();
    if (token) headers.set("x-csrf-token", token);
    return headers;
  },
});

/**
 * Refresh silencioso em andamento.
 *
 * Módulo, não estado de componente: se cinco requisições tomarem 401 ao mesmo
 * tempo, todas precisam esperar **o mesmo** refresh. Sem esta deduplicação
 * cinco rotações concorrentes chegariam ao servidor com o mesmo token, e o
 * backend — corretamente — trataria as perdedoras da corrida como reúso e
 * revogaria a família inteira, deslogando o usuário.
 */
let refreshEmVoo: Promise<boolean> | null = null;

async function refreshSilencioso(): Promise<boolean> {
  if (refreshEmVoo) return refreshEmVoo;

  refreshEmVoo = (async () => {
    try {
      // O refresh é mutável, logo exige CSRF.
      const csrf = await ensureCsrfToken(AUTH_API_BASE_URL);

      const response = await fetch(`${AUTH_API_BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: csrf ? { "x-csrf-token": csrf } : undefined,
      });

      return response.ok;
    } catch {
      return false;
    } finally {
      refreshEmVoo = null;
    }
  })();

  return refreshEmVoo;
}

/** Chamado no logout: a próxima sessão não deve herdar promessa nem token. */
export function resetAuthClientState(): void {
  refreshEmVoo = null;
  clearCsrfToken();
}

/**
 * Base query com CSRF e reautenticação.
 *
 * Em `401`, tenta **um único** refresh e repete a requisição original. Falhando,
 * devolve o 401 para que o provider de sessão leve ao login — nunca insiste,
 * porque insistir com refresh inválido é o caminho mais rápido para derrubar a
 * família de tokens.
 */
export function createAuthBaseQuery(): BaseQueryFn<
  MockRequestArgs,
  unknown,
  ApiError
> {
  return async (args, api, extraOptions) => {
    const metodo = (args.method ?? "GET").toUpperCase();

    // Método mutável sem token CSRF em mãos: busca antes de tentar, senão o
    // servidor responde 403 e a UI mostraria erro em vez de funcionar.
    if (!METODOS_SEGUROS.has(metodo) && !getCsrfToken()) {
      await ensureCsrfToken(AUTH_API_BASE_URL);
    }

    let result = await inner(args, api, extraOptions);

    const status = "error" in result && result.error ? result.error.status : null;

    // 403 de CSRF pode ser token velho (o servidor reiniciou, por exemplo):
    // renova uma vez e repete, sem envolver refresh de sessão.
    if (status === 403 && !METODOS_SEGUROS.has(metodo)) {
      clearCsrfToken();
      if (await ensureCsrfToken(AUTH_API_BASE_URL)) {
        result = await inner(args, api, extraOptions);
      }
    }

    const podeRenovar =
      status === 401 && !SEM_REFRESH.some((rota) => args.url.startsWith(rota));

    if (podeRenovar && (await refreshSilencioso())) {
      result = await inner(args, api, extraOptions);
    }

    if ("error" in result && result.error) {
      return { error: normalize(result.error) };
    }

    return { data: result.data };
  };
}
