import { baseApi } from "@/redux/reducers/queries/baseApi";
import type {
  SaveSchedulePayload,
  ScheduleDetail,
  ScheduleListItem,
  UncoveredEmployees,
  UpdateSchedulePayload,
} from "@/types/schedule";

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
    getScheduleById: builder.query<ScheduleDetail, string>({
      query: (id) => ({ url: `/schedules/${id}`, method: "GET" }),
      providesTags: (_r, _e, id) => [{ type: "Schedule", id }],
    }),
    /** Card "N pessoas sem escala" — o mesmo número do KPI da tela 6. */
    getUncoveredEmployees: builder.query<UncoveredEmployees, void>({
      query: () => ({ url: "/schedules/uncovered", method: "GET" }),
      providesTags: [{ type: "Schedule", id: "UNCOVERED" }],
    }),
    createSchedule: builder.mutation<ScheduleDetail, SaveSchedulePayload>({
      query: (body) => ({ url: "/schedules", method: "POST", body }),
      invalidatesTags: [
        { type: "Schedule", id: "LIST" },
        { type: "Schedule", id: "UNCOVERED" },
      ],
    }),
    updateSchedule: builder.mutation<ScheduleDetail, UpdateSchedulePayload>({
      query: ({ id, ...body }) => ({
        url: `/schedules/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Schedule", id },
        { type: "Schedule", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetScheduleListQuery,
  useGetScheduleByIdQuery,
  useGetUncoveredEmployeesQuery,
  useCreateScheduleMutation,
  useUpdateScheduleMutation,
} = scheduleApi;
