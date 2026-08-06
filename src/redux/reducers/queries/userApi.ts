import { baseApi } from "@/redux/reducers/queries/baseApi";
import type { UserListItem } from "@/types/user";

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserList: builder.query<UserListItem[], void>({
      query: () => ({ url: "/users", method: "GET" }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "User" as const, id })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),
  }),
});

export const { useGetUserListQuery } = userApi;
