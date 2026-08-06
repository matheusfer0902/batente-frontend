"use client";

import { useTranslation } from "react-i18next";
import { DataBoundary } from "@/components/shared/DataBoundary";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SkeletonText } from "@/components/ui/skeleton";
import { useAbsenceList } from "@/hooks/useAbsenceList";
import { TimeService } from "@/services/TimeService";
import { absenceStatuses } from "@/types/absence";
import { cn } from "@/lib/utils";

const HEAD =
  "border-b border-border px-5 py-2.5 text-left font-mono text-[9.5px] font-medium uppercase tracking-[0.14em] text-moon";

export function AbsenceList() {
  const { t } = useTranslation(["absence", "common"]);
  const {
    absences,
    status,
    setStatus,
    search,
    setSearch,
    isLoading,
    isError,
    retry,
  } = useAbsenceList();

  const filtered = search.trim().length > 0 || status !== "ALL";

  return (
    <>
      <PageHeader
        title={t("absence:title")}
        subtitle={t("absence:subtitle", { count: absences.length })}
        actions={
          <Button variant="default" size="entry" disabled>
            {t("absence:create")}
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3 px-5 py-5 md:px-8">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("absence:filters.search")}
          className="min-w-[260px] flex-1"
          aria-label={t("absence:filters.search")}
        />
        <label className="flex items-center gap-2 rounded-sm border border-border bg-gun-950 px-3.5 py-2.5">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-n400">
            {t("absence:filters.status")}
          </span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="bg-transparent text-[13.5px] text-linen outline-none"
          >
            <option value="ALL">{t("absence:status.ALL")}</option>
            {absenceStatuses.map((item) => (
              <option key={item} value={item}>
                {t(`absence:status.${item}`)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <DataBoundary
        isLoading={isLoading}
        isError={isError}
        onRetry={retry}
        isEmpty={absences.length === 0}
        skeleton={<SkeletonText lines={8} className="px-8" />}
        empty={
          <EmptyState
            title={filtered ? t("absence:emptyFiltered") : t("absence:empty")}
            className="mx-auto max-w-md py-12"
          />
        }
      >
        <div className="mx-5 mb-6 overflow-hidden rounded-sm border border-border bg-gun-950 md:mx-8">
          <table className="w-full border-collapse text-[13.5px]">
            <thead>
              <tr>
                <th className={cn(HEAD, "w-[28%]")}>{t("absence:table.employee")}</th>
                <th className={cn(HEAD, "w-[18%]")}>{t("absence:table.type")}</th>
                <th className={cn(HEAD, "w-[22%]")}>{t("absence:table.period")}</th>
                <th className={cn(HEAD, "w-[10%]")}>{t("absence:table.days")}</th>
                <th className={HEAD}>{t("absence:table.status")}</th>
              </tr>
            </thead>
            <tbody>
              {absences.map((absence) => (
                <tr
                  key={absence.id}
                  className="border-b border-border last:border-b-0"
                >
                  <td className="px-5 py-3 text-linen">{absence.employee.name}</td>
                  <td className="px-5 py-3 text-n300">{absence.type.name}</td>
                  <td className="px-5 py-3 font-mono text-n300">
                    {TimeService.dayMonth(absence.startDate)} →{" "}
                    {TimeService.dayMonth(absence.endDate)}
                  </td>
                  <td className="px-5 py-3 font-mono text-n300">{absence.days}</td>
                  <td className="px-5 py-3 font-mono text-[11px]">
                    <span
                      className={cn(
                        absence.status === "ACTIVE" && "text-chart",
                        absence.status === "SCHEDULED" && "text-sun",
                        absence.status === "ENDED" && "text-n400",
                      )}
                    >
                      ● {t(`absence:status.${absence.status}`)}
                    </span>
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
