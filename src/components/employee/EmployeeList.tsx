"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { DataBoundary } from "@/components/shared/DataBoundary";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SkeletonText } from "@/components/ui/skeleton";
import { useDepartment } from "@/hooks/useDepartment";
import { useEmployeeList } from "@/hooks/useEmployeeList";
import { EmployeeService } from "@/services/EmployeeService";
import { employeeStatuses } from "@/types/employee";
import { cn } from "@/lib/utils";

const HEAD =
  "border-b border-border px-5 py-2.5 text-left font-mono text-[9.5px] font-medium uppercase tracking-[0.14em] text-moon";

function AlertCard({
  count,
  titleKey,
  bodyKey,
  filterKey,
  active,
  onFilter,
}: {
  count: number;
  titleKey: string;
  bodyKey: string;
  filterKey: string;
  active: boolean;
  onFilter: () => void;
}) {
  const { t } = useTranslation("employee");
  if (count === 0) return null;

  return (
    <button
      type="button"
      onClick={onFilter}
      className={cn(
        "flex items-center gap-3.5 rounded-sm border border-sun/40 border-l-2 border-l-sun bg-gun-950 p-4 text-left transition-colors hover:bg-gun-900",
        active && "ring-1 ring-sun/50",
      )}
    >
      <span className="font-mono text-2xl text-sun">{count}</span>
      <div className="flex-1">
        <div className="text-[13.5px] font-medium text-linen">{t(titleKey)}</div>
        <div className="mt-0.5 text-xs text-n400">{t(bodyKey)}</div>
      </div>
      <span className="font-mono text-[10.5px] text-sun">{t(filterKey)}</span>
    </button>
  );
}

export function EmployeeList() {
  const { t } = useTranslation(["employee", "common"]);
  const { departments } = useDepartment();
  const {
    summary,
    employees,
    status,
    setStatus,
    departmentId,
    setDepartmentId,
    alertFilter,
    setAlertFilter,
    search,
    setSearch,
    isLoading,
    isError,
    retry,
  } = useEmployeeList();

  return (
    <>
      <PageHeader
        title={t("employee:title")}
        subtitle={
          summary
            ? t("employee:subtitle", {
                total: summary.total,
                active: summary.active,
              })
            : undefined
        }
        actions={
          <Button variant="default" size="entry" disabled>
            {t("employee:create")}
          </Button>
        }
      />

      {summary ? (
        <div className="grid gap-3.5 px-5 pb-0 md:grid-cols-2 md:px-8">
          <AlertCard
            count={summary.missingBadge}
            titleKey="alerts.missingBadge.title"
            bodyKey="alerts.missingBadge.body"
            filterKey="alerts.missingBadge.filter"
            active={alertFilter === "missing-badge"}
            onFilter={() =>
              setAlertFilter(
                alertFilter === "missing-badge" ? undefined : "missing-badge",
              )
            }
          />
          <AlertCard
            count={summary.missingSchedule}
            titleKey="alerts.missingSchedule.title"
            bodyKey="alerts.missingSchedule.body"
            filterKey="alerts.missingSchedule.filter"
            active={alertFilter === "missing-schedule"}
            onFilter={() =>
              setAlertFilter(
                alertFilter === "missing-schedule"
                  ? undefined
                  : "missing-schedule",
              )
            }
          />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 px-5 py-5 md:px-8">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("employee:filters.search")}
          className="min-w-[260px] flex-1"
          aria-label={t("employee:filters.search")}
        />
        <label className="flex items-center gap-2 rounded-sm border border-border bg-gun-950 px-3.5 py-2.5">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-n400">
            {t("employee:filters.status")}
          </span>
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as typeof status)
            }
            className="bg-transparent text-[13.5px] text-linen outline-none"
          >
            <option value="ALL">{t("employee:status.ALL")}</option>
            {employeeStatuses.map((s) => (
              <option key={s} value={s}>
                {t(`employee:status.${s}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 rounded-sm border border-border bg-gun-950 px-3.5 py-2.5">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-n400">
            {t("employee:filters.department")}
          </span>
          <select
            value={departmentId ?? ""}
            onChange={(e) =>
              setDepartmentId(e.target.value || undefined)
            }
            className="bg-transparent text-[13.5px] text-linen outline-none"
          >
            <option value="">{t("employee:filters.allDepartments")}</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <DataBoundary
        isLoading={isLoading}
        isError={isError}
        onRetry={retry}
        isEmpty={employees.length === 0}
        skeleton={<SkeletonText lines={10} className="px-8" />}
        empty={
          <EmptyState
            title={
              alertFilter || search || departmentId || status !== "ACTIVE"
                ? t("employee:emptyFiltered")
                : t("employee:empty")
            }
            className="mx-auto max-w-md py-12"
          />
        }
      >
        <div className="mx-5 mb-6 overflow-hidden rounded-sm border border-border bg-gun-950 md:mx-8">
          <table className="w-full border-collapse text-[13.5px]">
            <thead>
              <tr>
                <th className={cn(HEAD, "w-[27%]")}>{t("employee:table.employee")}</th>
                <th className={cn(HEAD, "w-[14%]")}>{t("employee:table.registration")}</th>
                <th className={cn(HEAD, "w-[17%]")}>{t("employee:table.department")}</th>
                <th className={cn(HEAD, "w-[15%]")}>{t("employee:table.badge")}</th>
                <th className={cn(HEAD, "w-[17%]")}>{t("employee:table.schedule")}</th>
                <th className={HEAD}>{t("employee:table.status")}</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => {
                const tone = EmployeeService.statusTone(employee.status);
                const flagged =
                  employee.flags.missingBadge || employee.flags.missingSchedule;
                return (
                  <tr
                    key={employee.id}
                    className={cn(
                      "border-b border-border last:border-b-0",
                      flagged && "bg-sun/[0.055] shadow-[inset_2px_0_0] shadow-sun",
                    )}
                  >
                    <td className="px-5 py-3 text-linen">
                      <Link
                        href={`/colaboradores/${employee.id}`}
                        className="hover:text-chart"
                      >
                        {employee.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 font-mono text-n300">
                      {employee.registration}
                    </td>
                    <td className="px-5 py-3 text-n300">{employee.department.name}</td>
                    <td className="px-5 py-3">
                      {employee.badgeCode ? (
                        <span className="font-mono text-n300">{employee.badgeCode}</span>
                      ) : (
                        <span className="rounded-sm border border-sun/45 px-1.5 py-0.5 font-mono text-[10.5px] tracking-wide text-sun">
                          {t("employee:badge.missing")}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {employee.scheduleName ? (
                        <span className="text-n300">{employee.scheduleName}</span>
                      ) : (
                        <span className="rounded-sm border border-sun/45 px-1.5 py-0.5 font-mono text-[10.5px] tracking-wide text-sun">
                          {t("employee:schedule.missing")}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 font-mono text-[11px]">
                      <span
                        className={cn(
                          tone === "active" && "text-chart",
                          tone === "vacation" && "text-sun",
                          tone === "inactive" && "text-n400",
                        )}
                      >
                        ● {t(`employee:${EmployeeService.statusKey(employee.status)}`)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </DataBoundary>
    </>
  );
}
