"use client";

import { useTranslation } from "react-i18next";
import { DataBoundary } from "@/components/shared/DataBoundary";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Input } from "@/components/ui/input";
import { SkeletonText } from "@/components/ui/skeleton";
import { useTimesheetMirrorList } from "@/hooks/useTimesheetMirrorList";
import { cn } from "@/lib/utils";

const MONTH_OPTIONS = ["2026-08", "2026-07"];

const HEAD =
  "border-b border-border px-5 py-2.5 text-left font-mono text-[9.5px] font-medium uppercase tracking-[0.14em] text-moon";

export function TimesheetMirrorList() {
  const { t } = useTranslation(["timesheet", "common"]);
  const {
    mirrors,
    month,
    setMonth,
    search,
    setSearch,
    isLoading,
    isError,
    retry,
  } = useTimesheetMirrorList();

  const filtered = search.trim().length > 0 || Boolean(month);

  return (
    <>
      <PageHeader
        title={t("timesheet:title")}
        subtitle={t("timesheet:subtitle", { count: mirrors.length })}
      />

      <div className="flex flex-wrap items-center gap-3 px-5 py-5 md:px-8">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("timesheet:filters.search")}
          className="min-w-[260px] flex-1"
          aria-label={t("timesheet:filters.search")}
        />
        <label className="flex items-center gap-2 rounded-sm border border-border bg-gun-950 px-3.5 py-2.5">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-n400">
            {t("timesheet:filters.month")}
          </span>
          <select
            value={month ?? ""}
            onChange={(e) => setMonth(e.target.value || undefined)}
            className="bg-transparent text-[13.5px] text-linen outline-none"
          >
            <option value="">{t("timesheet:filters.allMonths")}</option>
            {MONTH_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      <DataBoundary
        isLoading={isLoading}
        isError={isError}
        onRetry={retry}
        isEmpty={mirrors.length === 0}
        skeleton={<SkeletonText lines={8} className="px-8" />}
        empty={
          <EmptyState
            title={
              filtered ? t("timesheet:emptyFiltered") : t("timesheet:empty")
            }
            className="mx-auto max-w-md py-12"
          />
        }
      >
        <div className="mx-5 mb-6 overflow-hidden rounded-sm border border-border bg-gun-950 md:mx-8">
          <table className="w-full border-collapse text-[13.5px]">
            <thead>
              <tr>
                <th className={cn(HEAD, "w-[22%]")}>{t("timesheet:table.employee")}</th>
                <th className={cn(HEAD, "w-[12%]")}>{t("timesheet:table.registration")}</th>
                <th className={cn(HEAD, "w-[16%]")}>{t("timesheet:table.department")}</th>
                <th className={cn(HEAD, "w-[10%]")}>{t("timesheet:table.month")}</th>
                <th className={cn(HEAD, "w-[12%]")}>{t("timesheet:table.workedHours")}</th>
                <th className={cn(HEAD, "w-[10%]")}>{t("timesheet:table.balanceHours")}</th>
                <th className={HEAD}>{t("timesheet:table.status")}</th>
              </tr>
            </thead>
            <tbody>
              {mirrors.map((mirror) => (
                <tr
                  key={mirror.id}
                  className="border-b border-border last:border-b-0"
                >
                  <td className="px-5 py-3 text-linen">{mirror.employee.name}</td>
                  <td className="px-5 py-3 font-mono text-n300">
                    {mirror.employee.registration}
                  </td>
                  <td className="px-5 py-3 text-n300">{mirror.employee.department}</td>
                  <td className="px-5 py-3 font-mono text-n300">{mirror.month}</td>
                  <td className="px-5 py-3 font-mono text-n300">{mirror.workedHours}</td>
                  <td className="px-5 py-3 font-mono text-n300">{mirror.balanceHours}</td>
                  <td className="px-5 py-3 font-mono text-[11px]">
                    <span
                      className={cn(
                        mirror.status === "OPEN" && "text-chart",
                        mirror.status === "PENDING" && "text-sun",
                        mirror.status === "CONSOLIDATED" && "text-n400",
                      )}
                    >
                      ● {t(`timesheet:status.${mirror.status}`)}
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
