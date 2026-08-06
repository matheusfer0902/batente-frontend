"use client";

import { useGetUserListQuery } from "@/redux/reducers/queries/userApi";

export function useUserList() {
  const listQuery = useGetUserListQuery();

  return {
    users: listQuery.data ?? [],
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    retry: listQuery.refetch,
  };
}
