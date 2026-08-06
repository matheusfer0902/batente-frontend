import { baseApi } from "@/redux/reducers/queries/baseApi";
import type { BadgeListItem, BadgeQueryArgs } from "@/types/badge";

function buildBadgeQuery(args: BadgeQueryArgs = {}): string {
  const params = new URLSearchParams();
  if (args.status && args.status !== "ALL") params.set("status", args.status);
  if (args.q) params.set("q", args.q);
  const qs = params.toString();
  return qs ? `/badges?${qs}` : "/badges";
}

export const badgeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBadgeList: builder.query<BadgeListItem[], BadgeQueryArgs | void>({
      query: (args) => ({ url: buildBadgeQuery(args ?? {}), method: "GET" }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Badge" as const, id })),
              { type: "Badge", id: "LIST" },
            ]
          : [{ type: "Badge", id: "LIST" }],
    }),
  }),
});

export const { useGetBadgeListQuery } = badgeApi;
