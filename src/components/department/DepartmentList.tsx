"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { DataBoundary } from "@/components/shared/DataBoundary";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { SkeletonText } from "@/components/ui/skeleton";
import { useDepartment } from "@/hooks/useDepartment";
import { DepartmentService } from "@/services/DepartmentService";
import { cn } from "@/lib/utils";

const HEAD =
  "border-b border-border px-6 py-2.5 text-left font-mono text-[9.5px] font-medium uppercase tracking-[0.14em] text-moon";

export function DepartmentList() {
  const { t } = useTranslation(["department", "common"]);
  const { departments, isLoading, isError, retry } = useDepartment();

  return (
    <>
      <PageHeader
        title={t("department:title")}
        subtitle={t("department:subtitle", { count: departments.length })}
        actions={
          <Button variant="default" size="entry" disabled>
            {t("department:create")}
          </Button>
        }
      />

      <DataBoundary
        isLoading={isLoading}
        isError={isError}
        onRetry={retry}
        isEmpty={departments.length === 0}
        skeleton={<SkeletonText lines={8} className="p-6" />}
        empty={
          <EmptyState
            title={t("department:empty")}
            className="mx-auto max-w-md py-16"
          />
        }
      >
        <div className="overflow-hidden rounded-sm border border-border bg-gun-950">
          <table className="w-full border-collapse text-[13.5px]">
            <thead>
              <tr>
                <th className={cn(HEAD, "w-[40%]")}>
                  {t("department:table.name")}
                </th>
                <th className={cn(HEAD, "w-[20%]")}>
                  {t("department:table.people")}
                </th>
                <th className={cn(HEAD, "text-right")}>
                  {t("department:table.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {departments.map((department) => {
                const deletable = DepartmentService.canDelete(department);
                return (
                  <tr
                    key={department.id}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-6 py-3.5 text-linen">{department.name}</td>
                    <td className="px-6 py-3.5 font-mono text-n300">
                      {department.employeeCount}
                    </td>
                    <td className="px-6 py-3.5 text-right font-mono text-[11px] text-n400">
                      <span>{t("department:actions.edit")}</span>
                      <span className="mx-1.5">·</span>
                      <span className={deletable ? "text-cherry" : "text-gun-700"}>
                        {t("department:actions.delete")}
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
