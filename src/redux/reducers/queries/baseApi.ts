import { mockBaseQuery } from "@/lib/mock/mockBaseQuery";
import { createBaseApi } from "@/redux/reducers/queries/createBaseApi";
import { createFetchBaseQuery } from "@/redux/reducers/queries/fetchBaseQuery";

const isVitest =
  typeof process !== "undefined" && process.env.VITEST === "true";

/**
 * Dev/prod: `mockBaseQuery` (in-memory).
 * Vitest: `fetchBaseQuery` + MSW — mesmo contrato, caminho HTTP real.
 */
export const baseApi = createBaseApi(
  isVitest ? createFetchBaseQuery() : mockBaseQuery,
);
