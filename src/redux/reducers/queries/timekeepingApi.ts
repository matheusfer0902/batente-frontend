import { baseApi } from "@/redux/reducers/queries/baseApi";
import { withScenario } from "@/types/api";
import type {
  AdjustmentSummary,
  PendingSummary,
  TimekeepingQueryArgs,
  TimesheetMirrorListItem,
  TimesheetMirrorQueryArgs,
} from "@/types/timekeeping";

function buildMirrorQuery(args: TimesheetMirrorQueryArgs = {}): string {
  const params = new URLSearchParams();
  if (args.month) params.set("month", args.month);
  if (args.q) params.set("q", args.q);
  const qs = params.toString();
  return qs ? `/timekeeping/mirror?${qs}` : "/timekeeping/mirror";
}

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
    getTimesheetMirrorList: builder.query<
      TimesheetMirrorListItem[],
      TimesheetMirrorQueryArgs | void
    >({
      query: (args) => ({
        url: buildMirrorQuery(args ?? {}),
        method: "GET",
      }),
      providesTags: [{ type: "Timekeeping", id: "MIRROR" }],
    }),
  }),
});

export const {
  useGetPendingSummaryQuery,
  useGetAdjustmentSummaryQuery,
  useGetTimesheetMirrorListQuery,
} = timekeepingApi;
