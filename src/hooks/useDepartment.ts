"use client";

import {
  useCreateDepartmentMutation,
  useDeleteDepartmentMutation,
  useGetDepartmentListQuery,
  useUpdateDepartmentMutation,
} from "@/redux/reducers/queries/departmentApi";
import { DepartmentService } from "@/services/DepartmentService";
import type { CreateDepartmentPayload, UpdateDepartmentPayload } from "@/types/department";
import { useMemo } from "react";

export function useDepartment() {
  const listQuery = useGetDepartmentListQuery();
  const [createDepartment, createState] = useCreateDepartmentMutation();
  const [updateDepartment, updateState] = useUpdateDepartmentMutation();
  const [deleteDepartment, deleteState] = useDeleteDepartmentMutation();

  const departments = useMemo(
    () => DepartmentService.sortByName(listQuery.data ?? []),
    [listQuery.data],
  );

  return {
    departments,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    retry: listQuery.refetch,
    isCreating: createState.isLoading,
    isUpdating: updateState.isLoading,
    isDeleting: deleteState.isLoading,
    create: (payload: CreateDepartmentPayload) =>
      createDepartment(payload).unwrap(),
    update: (payload: UpdateDepartmentPayload) =>
      updateDepartment(payload).unwrap(),
    remove: (id: string) => deleteDepartment(id).unwrap(),
  };
}
