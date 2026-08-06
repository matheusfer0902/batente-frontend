"use client";

import { useMemo, useState } from "react";
import {
  useGetEmployeeListQuery,
  useGetEmployeeSummaryQuery,
} from "@/redux/reducers/queries/employeeApi";
import { EmployeeService } from "@/services/EmployeeService";
import type { EmployeeQueryArgs, EmployeeStatus } from "@/types/employee";

export function useEmployeeList() {
  const [status, setStatus] = useState<EmployeeStatus | "ALL">("ACTIVE");
  const [departmentId, setDepartmentId] = useState<string | undefined>();
  const [alertFilter, setAlertFilter] = useState<
    EmployeeQueryArgs["filter"] | undefined
  >();
  const [search, setSearch] = useState("");

  const queryArgs = useMemo<EmployeeQueryArgs>(
    () => ({
      status,
      departmentId,
      filter: alertFilter,
      q: search.trim() || undefined,
    }),
    [status, departmentId, alertFilter, search],
  );

  const summaryQuery = useGetEmployeeSummaryQuery();
  const listQuery = useGetEmployeeListQuery(queryArgs);

  const employees = useMemo(() => {
    const data = listQuery.data ?? [];
    return search.trim()
      ? EmployeeService.filterBySearch(data, search)
      : data;
  }, [listQuery.data, search]);

  return {
    summary: summaryQuery.data,
    employees,
    status,
    setStatus,
    departmentId,
    setDepartmentId,
    alertFilter,
    setAlertFilter,
    search,
    setSearch,
    isLoading: listQuery.isLoading || summaryQuery.isLoading,
    isError: listQuery.isError || summaryQuery.isError,
    retry: () => {
      void summaryQuery.refetch();
      void listQuery.refetch();
    },
  };
}
