"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { DataBoundary } from "@/components/shared/DataBoundary";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SkeletonText } from "@/components/ui/skeleton";
import { Select } from "@/components/ui/select";
import { useCanMutate } from "@/hooks/useCanMutate";
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
    toggleAlerta,
    search,
    setSearch,
    page,
    setPage,
    pageCount,
    total,
    isLoading,
    isError,
    retry,
  } = useEmployeeList();
  const { canCreate } = useCanMutate("employees");

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
          canCreate ? (
            <Button asChild size="entryInline">
              <Link href="/colaboradores/novo">{t("employee:create")}</Link>
            </Button>
          ) : null
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
            onFilter={() => toggleAlerta("missing-badge")}
          />
          <AlertCard
            count={summary.missingSchedule}
            titleKey="alerts.missingSchedule.title"
            bodyKey="alerts.missingSchedule.body"
            filterKey="alerts.missingSchedule.filter"
            active={alertFilter === "missing-schedule"}
            onFilter={() => toggleAlerta("missing-schedule")}
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
          <Select
            value={status}
            onChange={(e) => setStatus(e.currentTarget.value as typeof status)}
            className="h-auto w-auto border-0 bg-transparent p-0 pr-5 text-[13.5px]"
          >
            <option value="ALL">{t("employee:status.ALL")}</option>
            {employeeStatuses.map((s) => (
              <option key={s} value={s}>
                {t(`employee:status.${s}`)}
              </option>
            ))}
          </Select>
        </label>
        <label className="flex items-center gap-2 rounded-sm border border-border bg-gun-950 px-3.5 py-2.5">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-n400">
            {t("employee:filters.department")}
          </span>
          <Select
            value={departmentId ?? ""}
            onChange={(e) => setDepartmentId(e.currentTarget.value || undefined)}
            className="h-auto w-auto border-0 bg-transparent p-0 pr-5 text-[13.5px]"
          >
            <option value="">{t("employee:filters.allDepartments")}</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
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
                        href={`/colaboradores/${employee.id}/editar`}
                        className="hover:text-chart"
                      >
                        {employee.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 font-mono text-n300">
                      {employee.registration}
                    </td>
                    <td className="px-5 py-3 text-n300">
                      {employee.department?.name ?? "—"}
                    </td>
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
                          tone === "leave" && "text-sun",
                          tone === "terminated" && "text-n400",
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

        {/* "Mostrando 7 de 184" da tela 6. A paginação é do servidor: a busca
            também é, então navegar entre páginas mantém o filtro. */}
        <div className="mx-5 mb-6 flex items-center justify-between gap-3 md:mx-8">
          <span className="font-mono text-[11px] text-n400">
            {t("employee:showing", { shown: employees.length, total })}
          </span>

          {pageCount > 1 ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(page - 1, 1))}
                disabled={page <= 1}
              >
                {t("common:previous")}
              </Button>
              <span className="font-mono text-[11px] text-n300">
                {t("employee:pageOf", { page, pageCount })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(page + 1, pageCount))}
                disabled={page >= pageCount}
              >
                {t("common:next")}
              </Button>
            </div>
          ) : null}
        </div>
      </DataBoundary>
    </>
  );
}
