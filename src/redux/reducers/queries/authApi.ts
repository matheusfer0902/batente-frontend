import { baseApi } from "@/redux/reducers/queries/baseApi";
import type {
  AuthCredentials,
  CreateUserPayload,
  SessionUser,
} from "@/types/auth";

/**
 * Endpoints de sessão.
 *
 * Nenhum deles devolve token: o par de cookies é gravado pelo servidor na
 * resposta de `/auth/login` e `/auth/refresh`. `login` responde 204 sem corpo —
 * quem descobre a identidade é `getMe`, e é assim que o frontend deixa de
 * decidir qualquer coisa por conta própria.
 */
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<void, AuthCredentials>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      // Invalida a sessão em cache para que `getMe` refaça a busca e o papel
      // venha do servidor, não da resposta do login.
      invalidatesTags: ["Auth"],
    }),

    getMe: builder.query<SessionUser, void>({
      query: () => ({ url: "/auth/me", method: "GET" }),
      providesTags: ["Auth"],
    }),

    logout: builder.mutation<void, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      invalidatesTags: ["Auth"],
    }),

    /**
     * Criação de usuário por administrador — `POST /users`, não
     * `/auth/register`. Não existe rota pública de registro; o servidor
     * responde 403 a quem não é ADMIN, mesmo chamando a API direto.
     */
    createUser: builder.mutation<SessionUser, CreateUserPayload>({
      query: (payload) => ({ url: "/users", method: "POST", body: payload }),
    }),
  }),
});

export const {
  useLoginMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useLogoutMutation,
  useCreateUserMutation,
} = authApi;
