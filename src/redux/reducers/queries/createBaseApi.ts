import { createApi } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { ApiError, MockRequestArgs } from "@/types/api";

export const API_TAG_TYPES = [
  "Auth",
  "Access",
  "Device",
  "Timekeeping",
  "Department",
  "Employee",
  "Badge",
  "Schedule",
  "Absence",
  "AuditLog",
  "Gate",
  "Settings",
  "User",
] as const;

/**
 * Factory de API — permite trocar `mockBaseQuery` ↔ `fetchBaseQuery` sem
 * alterar endpoints nem hooks (Liskov / Plano B).
 *
 * `reducerPath` fica **literal**, nunca como parâmetro de tipo `string`.
 * Parametrizá-lo alarga o genérico `ReducerPath` do RTK Query para `string`, e
 * o `RootState` dele passa a ser uma assinatura de índice que exige que toda
 * chave do store seja um `CombinedState` — o que faz o `auth` deixar de ser
 * atribuível e quebra a tipagem do middleware, com uma mensagem que não aponta
 * para a causa. Para múltiplos transportes, roteie dentro do base query
 * (`hybridBaseQuery.ts`) em vez de criar outra instância.
 */
export function createBaseApi(
  baseQuery: BaseQueryFn<MockRequestArgs, unknown, ApiError>,
) {
  return createApi({
    reducerPath: "api",
    baseQuery,
    tagTypes: [...API_TAG_TYPES],
    endpoints: () => ({}),
  });
}
