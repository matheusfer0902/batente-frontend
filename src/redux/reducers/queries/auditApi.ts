import { baseApi } from "@/redux/reducers/queries/baseApi";
import type { AuditLogListItem } from "@/types/audit";

export const auditApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogList: builder.query<AuditLogListItem[], void>({
      query: () => ({ url: "/audit-logs", method: "GET" }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "AuditLog" as const, id })),
              { type: "AuditLog", id: "LIST" },
            ]
          : [{ type: "AuditLog", id: "LIST" }],
    }),
  }),
});

export const { useGetAuditLogListQuery } = auditApi;
