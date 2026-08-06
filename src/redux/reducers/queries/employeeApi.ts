import { baseApi } from "@/redux/reducers/queries/baseApi";
import type {
  CreateEmployeePayload,
  EmployeeListItem,
  EmployeeQueryArgs,
  EmployeeSummary,
  UpdateEmployeePayload,
} from "@/types/employee";

function buildEmployeeQuery(args: EmployeeQueryArgs = {}): string {
  const params = new URLSearchParams();
  if (args.status && args.status !== "ALL") params.set("status", args.status);
  if (args.departmentId) params.set("departmentId", args.departmentId);
  if (args.q) params.set("q", args.q);
  if (args.filter) params.set("filter", args.filter);
  const qs = params.toString();
  return qs ? `/employees?${qs}` : "/employees";
}

export const employeeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployeeSummary: builder.query<EmployeeSummary, void>({
      query: () => ({ url: "/employees/summary", method: "GET" }),
      providesTags: [{ type: "Employee", id: "SUMMARY" }],
    }),
    getEmployeeList: builder.query<EmployeeListItem[], EmployeeQueryArgs | void>({
      query: (args) => ({ url: buildEmployeeQuery(args ?? {}), method: "GET" }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Employee" as const, id })),
              { type: "Employee", id: "LIST" },
            ]
          : [{ type: "Employee", id: "LIST" }],
    }),
    getEmployeeById: builder.query<EmployeeListItem, string>({
      query: (id) => ({ url: `/employees/${id}`, method: "GET" }),
      providesTags: (_r, _e, id) => [{ type: "Employee", id }],
    }),
    createEmployee: builder.mutation<EmployeeListItem, CreateEmployeePayload>({
      query: (body) => ({ url: "/employees", method: "POST", body }),
      invalidatesTags: [
        { type: "Employee", id: "LIST" },
        { type: "Employee", id: "SUMMARY" },
      ],
    }),
    updateEmployee: builder.mutation<EmployeeListItem, UpdateEmployeePayload>({
      query: ({ id, ...body }) => ({
        url: `/employees/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Employee", id },
        { type: "Employee", id: "LIST" },
        { type: "Employee", id: "SUMMARY" },
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
} = employeeApi;
