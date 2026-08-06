"use client";

import { useGetDeviceListQuery } from "@/redux/reducers/queries/deviceApi";

export function useDeviceList() {
  const listQuery = useGetDeviceListQuery();

  return {
    devices: listQuery.data ?? [],
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    retry: listQuery.refetch,
  };
}
