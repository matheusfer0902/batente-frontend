"use client";

import { useGetScheduleListQuery } from "@/redux/reducers/queries/scheduleApi";

export function useScheduleList() {
  const listQuery = useGetScheduleListQuery();

  return {
    schedules: listQuery.data ?? [],
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    retry: listQuery.refetch,
  };
}
