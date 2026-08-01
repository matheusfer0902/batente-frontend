import { baseApi } from "@/redux/reducers/queries/baseApi";
import type {
  AuthCredentials,
  AuthResponse,
  RegisterPayload,
  User,
} from "@/types/auth";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, AuthCredentials>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),
    register: builder.mutation<AuthResponse, RegisterPayload>({
      query: (payload) => ({
        url: "/auth/register",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Auth"],
    }),
    getMe: builder.query<User, void>({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),
      providesTags: ["Auth"],
    }),
    logout: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useLogoutMutation,
} = authApi;
