"use client";

import {
  useGetDeviceListQuery,
  useGetPrimaryDeviceQuery,
} from "@/redux/reducers/queries/deviceApi";
import type { DeviceListItem } from "@/types/device";

function primaryAsListItem(
  device: NonNullable<ReturnType<typeof useGetPrimaryDeviceQuery>["data"]>,
): DeviceListItem {
  return {
    ...device,
    firmwareVersion: "—",
    serialNumber: "—",
  };
}

export function useDeviceList() {
  const listQuery = useGetDeviceListQuery();
  const primaryQuery = useGetPrimaryDeviceQuery(undefined, {
    skip: listQuery.isLoading || listQuery.isSuccess,
  });

  const devices: DeviceListItem[] =
    listQuery.data ??
    (listQuery.isError && primaryQuery.data
      ? [primaryAsListItem(primaryQuery.data)]
      : []);

  return {
    devices,
    isLoading: listQuery.isLoading || (listQuery.isError && primaryQuery.isLoading),
    isError: listQuery.isError && primaryQuery.isError,
    retry: listQuery.isError ? primaryQuery.refetch : listQuery.refetch,
  };
}
