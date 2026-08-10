"use client";

import { DataBoundary } from "@/components/shared/DataBoundary";
import { ScheduleForm } from "@/components/schedule/ScheduleForm";
import { SkeletonText } from "@/components/ui/skeleton";
import { useGetScheduleByIdQuery } from "@/redux/reducers/queries/scheduleApi";

/**
 * Carrega a escala antes de montar o formulário.
 *
 * O `ScheduleForm` semeia o estado do editor no primeiro render, então montá-lo
 * com `undefined` e preencher depois deixaria a grade em branco.
 */
export function ScheduleEditPage({ id }: { id: string }) {
  const { data, isLoading, isError, refetch } = useGetScheduleByIdQuery(id);

  return (
    <DataBoundary
      isLoading={isLoading}
      isError={isError}
      onRetry={refetch}
      skeleton={<SkeletonText lines={10} className="p-6" />}
    >
      {data ? <ScheduleForm schedule={data} /> : null}
    </DataBoundary>
  );
}
