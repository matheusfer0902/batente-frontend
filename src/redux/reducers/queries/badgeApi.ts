import { baseApi } from "@/redux/reducers/queries/baseApi";
import type {
  BadgeListItem,
  BadgeQueryArgs,
  BadgeStatusChangePayload,
  CredentialDetail,
  IssueBadgePayload,
  ReplaceBadgePayload,
} from "@/types/badge";

function buildBadgeQuery(args: BadgeQueryArgs = {}): string {
  const params = new URLSearchParams();
  if (args.status && args.status !== "ALL") params.set("status", args.status);
  if (args.q) params.set("q", args.q);
  const qs = params.toString();
  return qs ? `/badges?${qs}` : "/badges";
}

/** Toda escrita invalida a lista e o item — e o detalhe é a fonte do estado real. */
function invalida(id: string) {
  return [
    { type: "Badge" as const, id },
    { type: "Badge" as const, id: "LIST" },
  ];
}

export const badgeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBadgeList: builder.query<BadgeListItem[], BadgeQueryArgs | void>({
      query: (args) => ({ url: buildBadgeQuery(args ?? {}), method: "GET" }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Badge" as const, id })),
              { type: "Badge", id: "LIST" },
            ]
          : [{ type: "Badge", id: "LIST" }],
    }),

    /** Devolve o estado real (`CredentialStatus`), não a projeção da lista. */
    getBadgeById: builder.query<CredentialDetail, string>({
      query: (id) => ({ url: `/badges/${id}`, method: "GET" }),
      providesTags: (_r, _e, id) => [{ type: "Badge", id }],
    }),

    issueBadge: builder.mutation<CredentialDetail, IssueBadgePayload>({
      query: (body) => ({ url: "/badges", method: "POST", body }),
      invalidatesTags: [{ type: "Badge", id: "LIST" }],
    }),

    blockBadge: builder.mutation<CredentialDetail, BadgeStatusChangePayload>({
      query: ({ id, reason }) => ({
        url: `/badges/${id}/block`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: (_r, _e, { id }) => invalida(id),
    }),

    /**
     * Sem corpo. Não passar `body` é deliberado: o `fetchBaseQuery` só manda
     * `content-type: application/json` quando há corpo, e o Fastify recusa com
     * 400 (`FST_ERR_CTP_EMPTY_JSON_BODY`) um POST que declara JSON e vem vazio.
     */
    unblockBadge: builder.mutation<CredentialDetail, string>({
      query: (id) => ({ url: `/badges/${id}/unblock`, method: "POST" }),
      invalidatesTags: (_r, _e, id) => invalida(id),
    }),

    reportBadgeLoss: builder.mutation<CredentialDetail, BadgeStatusChangePayload>({
      query: ({ id, reason }) => ({
        url: `/badges/${id}/loss`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: (_r, _e, { id }) => invalida(id),
    }),

    revokeBadge: builder.mutation<CredentialDetail, BadgeStatusChangePayload>({
      query: ({ id, reason }) => ({
        url: `/badges/${id}/revocation`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: (_r, _e, { id }) => invalida(id),
    }),

    /**
     * Segunda via — revoga o informado e emite outro para a mesma pessoa, numa
     * transação no backend. Invalida também o anterior: ele mudou de estado.
     */
    replaceBadge: builder.mutation<CredentialDetail, ReplaceBadgePayload>({
      query: ({ id, ...body }) => ({
        url: `/badges/${id}/replacement`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => invalida(id),
    }),
  }),
});

export const {
  useGetBadgeListQuery,
  useGetBadgeByIdQuery,
  useIssueBadgeMutation,
  useBlockBadgeMutation,
  useUnblockBadgeMutation,
  useReportBadgeLossMutation,
  useRevokeBadgeMutation,
  useReplaceBadgeMutation,
} = badgeApi;
