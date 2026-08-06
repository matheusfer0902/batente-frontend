"use client";

import { useMemo, useState } from "react";
import { useGetTimesheetMirrorListQuery } from "@/redux/reducers/queries/timekeepingApi";
import type { TimesheetMirrorQueryArgs } from "@/types/timekeeping";

export function useTimesheetMirrorList() {
  const [month, setMonth] = useState<string | undefined>();
  const [search, setSearch] = useState("");

  const queryArgs = useMemo<TimesheetMirrorQueryArgs>(
    () => ({
      month,
      q: search.trim() || undefined,
    }),
    [month, search],
  );

  const listQuery = useGetTimesheetMirrorListQuery(queryArgs);

  return {
    mirrors: listQuery.data ?? [],
    month,
    setMonth,
    search,
    setSearch,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    retry: listQuery.refetch,
  };
}
