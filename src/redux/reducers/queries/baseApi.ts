import { mockBaseQuery } from "@/lib/mock/mockBaseQuery";
import { createBaseApi } from "@/redux/reducers/queries/createBaseApi";
import { createFetchBaseQuery } from "@/redux/reducers/queries/fetchBaseQuery";
import { createHybridBaseQuery } from "@/redux/reducers/queries/hybridBaseQuery";

const isVitest =
  typeof process !== "undefined" && process.env.VITEST === "true";

/**
 * Uma instância, dois transportes.
 *
 * `createHybridBaseQuery` manda `/auth/*` e `/users` ao backend real — cookies
 * `HttpOnly`, CSRF e refresh silencioso — e o resto ao mock, cujos módulos de
 * API ainda não existem no servidor.
 *
 * Em Vitest o "resto" vai para `fetchBaseQuery` + MSW, preservando o Plano B: o
 * caminho HTTP é real e o contrato é o mesmo (ver
 * `test/contracts/basequery.substitution.test.ts`).
 */
export const baseApi = createBaseApi(
  createHybridBaseQuery(isVitest ? createFetchBaseQuery() : mockBaseQuery),
);
