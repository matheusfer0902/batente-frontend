import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { ApiError, MockRequestArgs } from "@/types/api";
import { parseMockOverridePrefixes, resolveRealApiPrefixes } from "@/lib/apiRoutes";
import { createAuthBaseQuery } from "@/redux/reducers/queries/authBaseQuery";

/**
 * Roteia cada requisição para o transporte certo, por prefixo de URL.
 *
 * `/auth/*` e `/users` sempre usam backend real. Demais domínios entram no
 * cutover via `NEXT_PUBLIC_API_MODE=real` ou `NEXT_PUBLIC_REAL_API_PREFIXES` —
 * ver `docs/api-integration.md`.
 *
 * Roteamento por URL em vez de duas instâncias de `createApi` porque uma única
 * instância mantém um só `reducerPath`, um só middleware e — o que importa mais —
 * as tags de invalidação num só cache. Com duas instâncias, `invalidatesTags:
 * ["Auth"]` não alcançaria consultas registradas na outra.
 */
export function createHybridBaseQuery(
  mockBaseQuery: BaseQueryFn<MockRequestArgs, unknown, ApiError>,
): BaseQueryFn<MockRequestArgs, unknown, ApiError> {
  const real = createAuthBaseQuery();

  return (args, api, extraOptions) => {
    const path = args.url.split("?")[0] ?? args.url;
    const usaBackendReal = resolveRealApiPrefixes().some((prefixo) =>
      path.startsWith(prefixo),
    );
    const permaneceMock = parseMockOverridePrefixes().some((prefixo: string) =>
      path.startsWith(prefixo),
    );

    return usaBackendReal && !permaneceMock
      ? real(args, api, extraOptions)
      : mockBaseQuery(args, api, extraOptions);
  };
}
