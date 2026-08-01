import { baseApi } from "@/redux/reducers/queries/baseApi";
import type {
  CreateResourcePayload,
  Resource,
  UpdateResourcePayload,
} from "@/types/resource";

export const resourceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getResourceList: builder.query<Resource[], void>({
      query: () => ({
        url: "/resources",
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Resource" as const, id })),
              { type: "Resource", id: "LIST" },
            ]
          : [{ type: "Resource", id: "LIST" }],
    }),
    getResourceById: builder.query<Resource, string>({
      query: (id) => ({
        url: `/resources/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Resource", id }],
    }),
    createResource: builder.mutation<Resource, CreateResourcePayload>({
      query: (payload) => ({
        url: "/resources",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [{ type: "Resource", id: "LIST" }],
    }),
    updateResource: builder.mutation<Resource, UpdateResourcePayload>({
      query: ({ id, ...body }) => ({
        url: `/resources/${id}`,
        method: "PUT",
        body: { id, ...body },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Resource", id },
        { type: "Resource", id: "LIST" },
      ],
    }),
    deleteResource: builder.mutation<{ id: string }, string>({
      query: (id) => ({
        url: `/resources/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Resource", id },
        { type: "Resource", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetResourceListQuery,
  useGetResourceByIdQuery,
  useCreateResourceMutation,
  useUpdateResourceMutation,
  useDeleteResourceMutation,
} = resourceApi;
