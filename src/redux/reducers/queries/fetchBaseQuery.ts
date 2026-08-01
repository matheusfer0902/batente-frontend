import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { RootState } from "@/redux/store";
import type { ApiError, ApiErrorData, MockRequestArgs } from "@/types/api";

/** Base URL interceptada pelo MSW em testes e, futuramente, pelo backend real. */
export const API_ORIGIN =
  typeof window !== "undefined" ? window.location.origin : "http://localhost";

export const API_BASE_URL = `${API_ORIGIN}/api`;

function isApiErrorData(value: unknown): value is ApiErrorData {
  return (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    typeof (value as ApiErrorData).message === "string"
  );
}

function normalizeFetchError(error: FetchBaseQueryError): ApiError {
  const status = typeof error.status === "number" ? error.status : 500;
  const data = isApiErrorData(error.data)
    ? error.data
    : { message: "Request failed" };
  return { status, data };
}

export function createFetchBaseQuery(): BaseQueryFn<
  MockRequestArgs,
  unknown,
  ApiError
> {
  const inner = fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  });

  return async (args, api, extraOptions) => {
    const result = await inner(args, api, extraOptions);
    if ("error" in result && result.error) {
      return { error: normalizeFetchError(result.error) };
    }
    return { data: result.data };
  };
}
