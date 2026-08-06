"use client";

import { useMemo, useState } from "react";
import { useGetAbsenceListQuery } from "@/redux/reducers/queries/absenceApi";
import type { AbsenceQueryArgs, AbsenceStatus } from "@/types/absence";

export function useAbsenceList() {
  const [status, setStatus] = useState<AbsenceStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");

  const queryArgs = useMemo<AbsenceQueryArgs>(
    () => ({
      status,
      q: search.trim() || undefined,
    }),
    [status, search],
  );

  const listQuery = useGetAbsenceListQuery(queryArgs);

  return {
    absences: listQuery.data ?? [],
    status,
    setStatus,
    search,
    setSearch,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    retry: listQuery.refetch,
  };
}
