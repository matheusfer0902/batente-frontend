"use client";

import { useTranslation } from "react-i18next";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { DataBoundary } from "@/components/shared/DataBoundary";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { SkeletonText } from "@/components/ui/skeleton";
import { useAuditLogList } from "@/hooks/useAuditLogList";
import { TimeService } from "@/services/TimeService";
import { cn } from "@/lib/utils";

const HEAD =
  "border-b border-border px-6 py-2.5 text-left font-mono text-[9.5px] font-medium uppercase tracking-[0.14em] text-moon";

export function AuditLogList() {
  const { t } = useTranslation(["audit", "common"]);
  const { logs, isLoading, isError, retry } = useAuditLogList();

  return (
    <RoleGuard roles={["ADMIN"]}>
      <>
        <PageHeader
          title={t("audit:title")}
          subtitle={t("audit:subtitle", { count: logs.length })}
        />

        <DataBoundary
          isLoading={isLoading}
          isError={isError}
          onRetry={retry}
          isEmpty={logs.length === 0}
          skeleton={<SkeletonText lines={8} className="p-6" />}
          empty={
            <EmptyState title={t("audit:empty")} className="mx-auto max-w-md py-16" />
          }
        >
          <div className="overflow-hidden rounded-sm border border-border bg-gun-950">
            <table className="w-full border-collapse text-[13.5px]">
              <thead>
                <tr>
                  <th className={cn(HEAD, "w-[14%]")}>{t("audit:table.occurredAt")}</th>
                  <th className={cn(HEAD, "w-[18%]")}>{t("audit:table.actor")}</th>
                  <th className={cn(HEAD, "w-[14%]")}>{t("audit:table.action")}</th>
                  <th className={cn(HEAD, "w-[14%]")}>{t("audit:table.resource")}</th>
                  <th className={HEAD}>{t("audit:table.summary")}</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-6 py-3.5 font-mono text-n300">
                      {TimeService.shortDate(log.occurredAt)}
                    </td>
                    <td className="px-6 py-3.5 text-linen">{log.actor.name}</td>
                    <td className="px-6 py-3.5 font-mono text-[11px] text-n400">
                      {log.action}
                    </td>
                    <td className="px-6 py-3.5 text-n300">{log.resource}</td>
                    <td className="px-6 py-3.5 text-n300">{log.summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-border px-6 py-4 text-xs text-n400">
              {t("audit:note")}
            </div>
          </div>
        </DataBoundary>
      </>
    </RoleGuard>
  );
}
