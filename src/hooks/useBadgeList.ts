"use client";

import { useMemo, useState } from "react";
import { useGetBadgeListQuery } from "@/redux/reducers/queries/badgeApi";
import type { BadgeQueryArgs, BadgeStatus } from "@/types/badge";

export function useBadgeList() {
  const [status, setStatus] = useState<BadgeStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");

  const queryArgs = useMemo<BadgeQueryArgs>(
    () => ({
      status,
      q: search.trim() || undefined,
    }),
    [status, search],
  );

  const listQuery = useGetBadgeListQuery(queryArgs);

  return {
    badges: listQuery.data ?? [],
    status,
    setStatus,
    search,
    setSearch,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    retry: listQuery.refetch,
  };
}
