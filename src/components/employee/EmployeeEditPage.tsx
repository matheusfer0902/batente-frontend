"use client";

import { DataBoundary } from "@/components/shared/DataBoundary";
import { EmployeeForm } from "@/components/employee/EmployeeForm";
import { SkeletonText } from "@/components/ui/skeleton";
import { useGetEmployeeByIdQuery } from "@/redux/reducers/queries/employeeApi";

/**
 * Carrega a ficha antes de montar o formulário — o RHF semeia os
 * `defaultValues` no primeiro render, então montar vazio e preencher depois
 * deixaria os campos em branco.
 */
export function EmployeeEditPage({ id }: { id: string }) {
  const { data, isLoading, isError, refetch } = useGetEmployeeByIdQuery(id);

  return (
    <DataBoundary
      isLoading={isLoading}
      isError={isError}
      onRetry={refetch}
      skeleton={<SkeletonText lines={10} className="p-6" />}
    >
      {data ? <EmployeeForm employee={data} /> : null}
    </DataBoundary>
  );
}
