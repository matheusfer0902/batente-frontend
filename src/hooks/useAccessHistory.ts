"use client";

import { useMemo, useState } from "react";
import { useGetAccessHistoryListQuery } from "@/redux/reducers/queries/accessApi";
import type {
  AccessDecision,
  AccessHistoryQueryArgs,
  AccessMode,
} from "@/types/access";

export function useAccessHistory() {
  const [decision, setDecision] = useState<AccessDecision | "ALL">("ALL");
  const [mode, setMode] = useState<AccessMode | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [badgeCode, setBadgeCode] = useState("");

  const queryArgs = useMemo<AccessHistoryQueryArgs>(
    () => ({
      decision,
      mode,
      q: search.trim() || undefined,
      badgeCode: badgeCode.trim() || undefined,
    }),
    [decision, mode, search, badgeCode],
  );

  const listQuery = useGetAccessHistoryListQuery(queryArgs);

  return {
    events: listQuery.data ?? [],
    decision,
    setDecision,
    mode,
    setMode,
    search,
    setSearch,
    badgeCode,
    setBadgeCode,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    retry: listQuery.refetch,
  };
}
