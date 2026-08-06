"use client";

import { useGetGateMonitorQuery } from "@/redux/reducers/queries/gateApi";

const GATE_POLL_MS = 10_000;

export function useGateMonitor() {
  const monitorQuery = useGetGateMonitorQuery(undefined, {
    pollingInterval: GATE_POLL_MS,
  });

  return {
    monitor: monitorQuery.data,
    queue: monitorQuery.data?.queue ?? [],
    credentials: monitorQuery.data?.credentials ?? [],
    deviceOnline: monitorQuery.data?.deviceOnline ?? false,
    isLoading: monitorQuery.isLoading,
    isError: monitorQuery.isError,
    retry: monitorQuery.refetch,
  };
}
