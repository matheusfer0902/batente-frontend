import { baseApi } from "@/redux/reducers/queries/baseApi";
import { AccessService } from "@/services/AccessService";
import { withScenario } from "@/types/api";
import type {
  AccessEvent,
  AccessEventPage,
  AccessHistoryQueryArgs,
  AccessQueryArgs,
  AccessStats,
} from "@/types/access";

function buildAccessQuery(args: AccessHistoryQueryArgs = {}): string {
  const params = new URLSearchParams();
  if (args.page) params.set("page", String(args.page));
  if (args.limit) params.set("limit", String(args.limit));
  if (args.from) params.set("from", args.from);
  if (args.to) params.set("to", args.to);
  if (args.decision && args.decision !== "ALL") params.set("decision", args.decision);
  if (args.mode && args.mode !== "ALL") params.set("mode", args.mode);
  if (args.q) params.set("q", args.q);
  if (args.badgeCode) params.set("badgeCode", args.badgeCode);
  const qs = params.toString();
  return qs ? `/access-events?${qs}` : "/access-events";
}

export const accessApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAccessEventList: builder.query<AccessEvent[], AccessQueryArgs | void>({
      query: (args) => ({
        url: withScenario(
          args?.limit ? `/access-events?limit=${args.limit}` : "/access-events",
          args?.scenario,
        ),
        method: "GET",
      }),
      transformResponse: (response: unknown) =>
        AccessService.parseEventListResponse(response).items,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Access" as const, id })),
              { type: "Access", id: "LIST" },
            ]
          : [{ type: "Access", id: "LIST" }],
    }),
    getAccessHistoryList: builder.query<
      AccessEventPage,
      AccessHistoryQueryArgs | void
    >({
      query: (args) => ({
        url: withScenario(buildAccessQuery(args ?? {}), args?.scenario),
        method: "GET",
      }),
      transformResponse: (response: unknown) =>
        AccessService.parseEventListResponse(response),
      providesTags: [{ type: "Access", id: "HISTORY" }],
    }),
    getAccessStats: builder.query<AccessStats, AccessQueryArgs | void>({
      query: (args) => ({
        url: withScenario("/access-events/stats", args?.scenario),
        method: "GET",
      }),
      providesTags: [{ type: "Access", id: "STATS" }],
    }),
    getAccessEventById: builder.query<AccessEvent, string>({
      query: (id) => ({
        url: `/access-events/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Access", id }],
    }),
  }),
});

export const {
  useGetAccessEventListQuery,
  useGetAccessHistoryListQuery,
  useGetAccessStatsQuery,
  useGetAccessEventByIdQuery,
} = accessApi;
