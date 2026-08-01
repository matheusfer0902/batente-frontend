import { createApi } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { ApiError, MockRequestArgs } from "@/types/api";

export const API_TAG_TYPES = [
  "Auth",
  "Resource",
  "Access",
  "Device",
  "Timekeeping",
] as const;

/**
 * Factory de API — permite trocar `mockBaseQuery` ↔ `fetchBaseQuery` sem
 * alterar endpoints nem hooks (Liskov / Plano B).
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
