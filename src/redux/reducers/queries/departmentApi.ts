import { baseApi } from "@/redux/reducers/queries/baseApi";
import type {
  CreateDepartmentPayload,
  Department,
  UpdateDepartmentPayload,
} from "@/types/department";

export const departmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDepartmentList: builder.query<Department[], void>({
      query: () => ({ url: "/departments", method: "GET" }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Department" as const, id })),
              { type: "Department", id: "LIST" },
            ]
          : [{ type: "Department", id: "LIST" }],
    }),
    createDepartment: builder.mutation<Department, CreateDepartmentPayload>({
      query: (body) => ({ url: "/departments", method: "POST", body }),
      invalidatesTags: [{ type: "Department", id: "LIST" }],
    }),
    updateDepartment: builder.mutation<Department, UpdateDepartmentPayload>({
      query: ({ id, ...body }) => ({
        url: `/departments/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Department", id },
        { type: "Department", id: "LIST" },
      ],
    }),
    deleteDepartment: builder.mutation<{ id: string }, string>({
      query: (id) => ({ url: `/departments/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Department", id },
        { type: "Department", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetDepartmentListQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} = departmentApi;
