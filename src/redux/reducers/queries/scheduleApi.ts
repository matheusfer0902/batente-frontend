import { baseApi } from "@/redux/reducers/queries/baseApi";
import type { ScheduleListItem } from "@/types/schedule";

export const scheduleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getScheduleList: builder.query<ScheduleListItem[], void>({
      query: () => ({ url: "/schedules", method: "GET" }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Schedule" as const, id })),
              { type: "Schedule", id: "LIST" },
            ]
          : [{ type: "Schedule", id: "LIST" }],
    }),
  }),
});

export const { useGetScheduleListQuery } = scheduleApi;
