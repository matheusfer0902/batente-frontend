import { baseApi } from "@/redux/reducers/queries/baseApi";
import type {
  AssignSchedulePayload,
  CreateEmployeePayload,
  EmployeeDetail,
  EmployeeListPage,
  EmployeeQueryArgs,
  EmployeeSummary,
  TerminateEmployeePayload,
  UpdateEmployeePayload,
} from "@/types/employee";

function buildEmployeeQuery(args: EmployeeQueryArgs = {}): string {
  const params = new URLSearchParams();
  if (args.status && args.status !== "ALL") params.set("status", args.status);
  if (args.departmentId) params.set("departmentId", args.departmentId);
  if (args.q) params.set("q", args.q);
  if (args.filter) params.set("filter", args.filter);
  if (args.page) params.set("page", String(args.page));
  if (args.limit) params.set("limit", String(args.limit));

  const qs = params.toString();
  return qs ? `/employees?${qs}` : "/employees";
}

/**
 * `SUMMARY` é uma tag à parte porque os KPIs mudam com qualquer escrita —
 * cadastrar, desligar, trocar escala — enquanto a lista filtrada nem sempre.
 */
export const employeeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployeeSummary: builder.query<EmployeeSummary, void>({
      query: () => ({ url: "/employees/summary", method: "GET" }),
      providesTags: [{ type: "Employee", id: "SUMMARY" }],
    }),
    getEmployeeList: builder.query<EmployeeListPage, EmployeeQueryArgs | void>({
      query: (args) => ({ url: buildEmployeeQuery(args ?? {}), method: "GET" }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({
                type: "Employee" as const,
                id,
              })),
              { type: "Employee", id: "LIST" },
            ]
          : [{ type: "Employee", id: "LIST" }],
    }),
    getEmployeeById: builder.query<EmployeeDetail, string>({
      query: (id) => ({ url: `/employees/${id}`, method: "GET" }),
      providesTags: (_r, _e, id) => [{ type: "Employee", id }],
    }),
    createEmployee: builder.mutation<EmployeeDetail, CreateEmployeePayload>({
      query: (body) => ({ url: "/employees", method: "POST", body }),
      invalidatesTags: [
        { type: "Employee", id: "LIST" },
        { type: "Employee", id: "SUMMARY" },
        // Cadastrar vincula uma vigência, então "N sem escala" muda.
        { type: "Schedule", id: "LIST" },
        { type: "Schedule", id: "UNCOVERED" },
      ],
    }),
    updateEmployee: builder.mutation<EmployeeDetail, UpdateEmployeePayload>({
      query: ({ id, ...body }) => ({
        url: `/employees/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Employee", id },
        { type: "Employee", id: "LIST" },
      ],
    }),
    terminateEmployee: builder.mutation<
      EmployeeDetail,
      TerminateEmployeePayload
    >({
      query: ({ id, terminationDate }) => ({
        url: `/employees/${id}/termination`,
        method: "POST",
        body: { terminationDate },
      }),
      // RN-2.3 revoga os crachás em cascata no banco — o cache de crachás
      // ficaria mentindo se não saísse junto.
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Employee", id },
        { type: "Employee", id: "LIST" },
        { type: "Employee", id: "SUMMARY" },
        { type: "Badge", id: "LIST" },
      ],
    }),
    assignSchedule: builder.mutation<EmployeeDetail, AssignSchedulePayload>({
      query: ({ id, ...body }) => ({
        url: `/employees/${id}/schedules`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Employee", id },
        { type: "Employee", id: "LIST" },
        { type: "Employee", id: "SUMMARY" },
        { type: "Schedule", id: "LIST" },
        { type: "Schedule", id: "UNCOVERED" },
      ],
    }),
  }),
});

export const {
  useGetEmployeeSummaryQuery,
  useGetEmployeeListQuery,
  useGetEmployeeByIdQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useTerminateEmployeeMutation,
  useAssignScheduleMutation,
} = employeeApi;
