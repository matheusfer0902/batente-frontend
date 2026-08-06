"use client";

import { useTranslation } from "react-i18next";
import { DataBoundary } from "@/components/shared/DataBoundary";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { SkeletonText } from "@/components/ui/skeleton";
import { useScheduleList } from "@/hooks/useScheduleList";
import { cn } from "@/lib/utils";

const HEAD =
  "border-b border-border px-6 py-2.5 text-left font-mono text-[9.5px] font-medium uppercase tracking-[0.14em] text-moon";

export function ScheduleList() {
  const { t } = useTranslation(["schedule", "common"]);
  const { schedules, isLoading, isError, retry } = useScheduleList();

  return (
    <>
      <PageHeader
        title={t("schedule:title")}
        subtitle={t("schedule:subtitle", { count: schedules.length })}
        actions={
          <Button variant="default" size="entry" disabled>
            {t("schedule:create")}
          </Button>
        }
      />

      <DataBoundary
        isLoading={isLoading}
        isError={isError}
        onRetry={retry}
        isEmpty={schedules.length === 0}
        skeleton={<SkeletonText lines={6} className="p-6" />}
        empty={
          <EmptyState title={t("schedule:empty")} className="mx-auto max-w-md py-16" />
        }
      >
        <div className="overflow-hidden rounded-sm border border-border bg-gun-950">
          <table className="w-full border-collapse text-[13.5px]">
            <thead>
              <tr>
                <th className={cn(HEAD, "w-[35%]")}>{t("schedule:table.name")}</th>
                <th className={cn(HEAD, "w-[15%]")}>{t("schedule:table.weeklyHours")}</th>
                <th className={cn(HEAD, "w-[15%]")}>{t("schedule:table.employeeCount")}</th>
                <th className={cn(HEAD, "w-[20%]")}>{t("schedule:table.shiftType")}</th>
                <th className={cn(HEAD, "text-right")}>{t("schedule:table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((schedule) => (
                <tr
                  key={schedule.id}
                  className="border-b border-border last:border-b-0"
                >
                  <td className="px-6 py-3.5 text-linen">{schedule.name}</td>
                  <td className="px-6 py-3.5 font-mono text-n300">
                    {schedule.weeklyHours}h
                  </td>
                  <td className="px-6 py-3.5 font-mono text-n300">
                    {schedule.employeeCount}
                  </td>
                  <td className="px-6 py-3.5 text-n300">
                    {t(`schedule:shiftType.${schedule.shiftType}`)}
                  </td>
                  <td className="px-6 py-3.5 text-right font-mono text-[11px] text-n400">
                    {t("schedule:actions.edit")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataBoundary>
    </>
  );
}
