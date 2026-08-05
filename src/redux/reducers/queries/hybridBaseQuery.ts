import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { ApiError, MockRequestArgs } from "@/types/api";
import { createAuthBaseQuery } from "@/redux/reducers/queries/authBaseQuery";

/**
 * Roteia cada requisição para o transporte certo, por prefixo de URL.
 *
 * O cutover é só de autenticação: `/auth/*` e `/users` já têm backend real
 * (cookies `HttpOnly`, CSRF, refresh silencioso), enquanto acessos,
 * dispositivos e ponto seguem no mock enquanto seus módulos não existem.
 *
 * Roteamento por URL em vez de duas instâncias de `createApi` porque uma única
 * instância mantém um só `reducerPath`, um só middleware e — o que importa mais —
 * as tags de invalidação num só cache. Com duas instâncias, `invalidatesTags:
 * ["Auth"]` não alcançaria consultas registradas na outra.
 */
const ROTAS_REAIS = ["/auth", "/users"];

export function createHybridBaseQuery(
  mockBaseQuery: BaseQueryFn<MockRequestArgs, unknown, ApiError>,
): BaseQueryFn<MockRequestArgs, unknown, ApiError> {
  const real = createAuthBaseQuery();

  return (args, api, extraOptions) => {
    const usaBackendReal = ROTAS_REAIS.some((prefixo) =>
      args.url.startsWith(prefixo),
    );

    return usaBackendReal
      ? real(args, api, extraOptions)
      : mockBaseQuery(args, api, extraOptions);
  };
}
