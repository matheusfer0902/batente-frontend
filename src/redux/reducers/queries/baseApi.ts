import { createApi } from "@reduxjs/toolkit/query/react";
import { mockBaseQuery } from "@/lib/mock/mockBaseQuery";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: mockBaseQuery,
  tagTypes: ["Auth", "Resource"],
  endpoints: () => ({}),
});
