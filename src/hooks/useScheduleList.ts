"use client";

import { useMemo } from "react";
import {
  useCreateScheduleMutation,
  useGetScheduleListQuery,
  useGetUncoveredEmployeesQuery,
  useUpdateScheduleMutation,
} from "@/redux/reducers/queries/scheduleApi";
import { ScheduleService } from "@/services/ScheduleService";
import type {
  SaveSchedulePayload,
  UpdateSchedulePayload,
} from "@/types/schedule";

export function useScheduleList() {
  const listQuery = useGetScheduleListQuery();
  // Consulta separada de propósito: o card "N sem escala" pode falhar sem
  // derrubar a lista — é o estado 2b de `docs/panel.md`.
  const uncoveredQuery = useGetUncoveredEmployeesQuery();
  const [createSchedule, createState] = useCreateScheduleMutation();
  const [updateSchedule, updateState] = useUpdateScheduleMutation();

  const schedules = useMemo(
    () => ScheduleService.sortByName(listQuery.data ?? []),
    [listQuery.data],
  );

  return {
    schedules,
    uncoveredCount: uncoveredQuery.data?.count ?? 0,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    retry: listQuery.refetch,
    isSaving: createState.isLoading || updateState.isLoading,
    create: (payload: SaveSchedulePayload) => createSchedule(payload).unwrap(),
    update: (payload: UpdateSchedulePayload) => updateSchedule(payload).unwrap(),
  };
}
