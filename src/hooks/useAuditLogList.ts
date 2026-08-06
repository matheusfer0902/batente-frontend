"use client";

import { useGetAuditLogListQuery } from "@/redux/reducers/queries/auditApi";

export function useAuditLogList() {
  const listQuery = useGetAuditLogListQuery();

  return {
    logs: listQuery.data ?? [],
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    retry: listQuery.refetch,
  };
}
