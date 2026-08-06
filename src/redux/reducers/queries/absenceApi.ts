import { baseApi } from "@/redux/reducers/queries/baseApi";
import type { AbsenceListItem, AbsenceQueryArgs } from "@/types/absence";

function buildAbsenceQuery(args: AbsenceQueryArgs = {}): string {
  const params = new URLSearchParams();
  if (args.status && args.status !== "ALL") params.set("status", args.status);
  if (args.q) params.set("q", args.q);
  const qs = params.toString();
  return qs ? `/absences?${qs}` : "/absences";
}

export const absenceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAbsenceList: builder.query<AbsenceListItem[], AbsenceQueryArgs | void>({
      query: (args) => ({ url: buildAbsenceQuery(args ?? {}), method: "GET" }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Absence" as const, id })),
              { type: "Absence", id: "LIST" },
            ]
          : [{ type: "Absence", id: "LIST" }],
    }),
  }),
});

export const { useGetAbsenceListQuery } = absenceApi;
