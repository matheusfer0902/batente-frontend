import { baseApi } from "@/redux/reducers/queries/baseApi";
import { withScenario } from "@/types/api";
import type {
  AdjustmentSummary,
  PendingSummary,
  TimekeepingQueryArgs,
} from "@/types/timekeeping";

/**
 * Um endpoint por bloco do Início: assim um deles pode falhar sem derrubar
 * os outros (estado 2b do design).
 */
export const timekeepingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPendingSummary: builder.query<PendingSummary, TimekeepingQueryArgs | void>({
      query: (args) => ({
        url: withScenario("/timekeeping/pending", args?.scenario),
        method: "GET",
      }),
      providesTags: [{ type: "Timekeeping", id: "PENDING" }],
    }),
    getAdjustmentSummary: builder.query<
      AdjustmentSummary,
      TimekeepingQueryArgs | void
    >({
      query: (args) => ({
        url: withScenario("/timekeeping/adjustments", args?.scenario),
        method: "GET",
      }),
      providesTags: [{ type: "Timekeeping", id: "ADJUSTMENTS" }],
    }),
  }),
});

export const { useGetPendingSummaryQuery, useGetAdjustmentSummaryQuery } =
  timekeepingApi;
