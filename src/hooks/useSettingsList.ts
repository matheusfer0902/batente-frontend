"use client";

import { useGetSettingsListQuery } from "@/redux/reducers/queries/settingsApi";

export function useSettingsList() {
  const listQuery = useGetSettingsListQuery();

  return {
    settings: listQuery.data ?? [],
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    retry: listQuery.refetch,
  };
}
