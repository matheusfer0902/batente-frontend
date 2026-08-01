import { baseApi } from "@/redux/reducers/queries/baseApi";
import { withScenario } from "@/types/api";
import type {
  AccessEvent,
  AccessQueryArgs,
  AccessStats,
} from "@/types/access";

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
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Access" as const, id })),
              { type: "Access", id: "LIST" },
            ]
          : [{ type: "Access", id: "LIST" }],
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
  useGetAccessStatsQuery,
  useGetAccessEventByIdQuery,
} = accessApi;
