"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { DataBoundary } from "@/components/shared/DataBoundary";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { SkeletonText } from "@/components/ui/skeleton";
import { useCanMutate } from "@/hooks/useCanMutate";
import { useGetScheduleByIdQuery } from "@/redux/reducers/queries/scheduleApi";
import { ScheduleService } from "@/services/ScheduleService";

/** Tela 21 — os sete dias, sem edição. */
export function ScheduleDetailView({ id }: { id: string }) {
  const { t } = useTranslation(["schedule", "common"]);
  const { data, isLoading, isError, refetch } = useGetScheduleByIdQuery(id);
  const { canEdit } = useCanMutate("schedules");

  return (
    <>
      <PageHeader
        title={data?.name ?? t("schedule:title")}
        subtitle={
          data
            ? t("schedule:detailSubtitle", {
                load: ScheduleService.formatMinutes(data.weeklyMinutes),
                tolerance: data.toleranceMinutes,
                minBreak: data.minBreakMinutes,
              })
            : undefined
        }
        actions={
          canEdit && data ? (
            <Button asChild size="entryInline" variant="outline">
              <Link href={`/escalas/${data.id}/editar`}>
                {t("common:edit")}
              </Link>
            </Button>
          ) : null
        }
      />

      <DataBoundary
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        skeleton={<SkeletonText lines={8} className="p-6" />}
      >
        <div className="px-5 py-5 md:px-8">
          <ul className="divide-y divide-border overflow-hidden rounded-sm border border-border bg-gun-950">
            {(data?.days ?? []).map((dia) => (
              <li
                key={dia.weekday}
                className="flex items-center justify-between gap-4 px-5 py-3"
              >
                <span
                  className={
                    dia.isWorkday ? "text-linen" : "text-n400"
                  }
                >
                  {t(`schedule:weekday.${dia.weekday}`)}
                </span>

                <span className="flex-1 text-right font-mono text-[12.5px] text-n300">
                  {dia.isWorkday
                    ? dia.breakStart && dia.breakEnd
                      ? `${dia.entryTime} · ${dia.breakStart} — ${dia.breakEnd} · ${dia.exitTime}`
                      : `${dia.entryTime} — ${dia.exitTime}`
                    : t("schedule:grid.dayOff")}
                </span>

                <span className="w-16 text-right font-mono text-[12.5px] text-linen">
                  {dia.isWorkday
                    ? ScheduleService.formatMinutes(dia.expectedMinutes)
                    : "—"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </DataBoundary>
    </>
  );
}
