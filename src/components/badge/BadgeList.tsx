"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { DataBoundary } from "@/components/shared/DataBoundary";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SkeletonText } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useBadgeList } from "@/hooks/useBadgeList";
import { PermissionService } from "@/services/PermissionService";
import { TimeService } from "@/services/TimeService";
import { badgeStatuses } from "@/types/badge";
import { cn } from "@/lib/utils";

const HEAD =
  "border-b border-border px-5 py-2.5 text-left font-mono text-[9.5px] font-medium uppercase tracking-[0.14em] text-moon";

export function BadgeList() {
  const { t } = useTranslation(["badge", "common"]);
  const router = useRouter();
  const { user } = useAuth();
  // Não é `useCanMutate("badges")`: aquele inclui OPERADOR, que escreve neste
  // domínio (bloqueia, reporta perda) mas não emite. O botão precisa do mesmo
  // corte de `/crachas/novo`, senão apareceria para quem o RoleGuard barra.
  const canCreate = PermissionService.canIssueBadge(user);
  const {
    badges,
    status,
    setStatus,
    search,
    setSearch,
    isLoading,
    isError,
    retry,
  } = useBadgeList();

  const filtered = search.trim().length > 0 || status !== "ALL";

  return (
    <>
      <PageHeader
        title={t("badge:title")}
        subtitle={t("badge:subtitle", { count: badges.length })}
        actions={
          canCreate ? (
            <Button
              variant="default"
              size="entry"
              onClick={() => router.push("/crachas/novo")}
            >
              {t("badge:create")}
            </Button>
          ) : null
        }
      />

      <div className="flex flex-wrap items-center gap-3 px-5 py-5 md:px-8">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("badge:filters.search")}
          className="min-w-[260px] flex-1 font-mono"
          aria-label={t("badge:filters.search")}
        />
        <label className="flex items-center gap-2 rounded-sm border border-border bg-gun-950 px-3.5 py-2.5">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-n400">
            {t("badge:filters.status")}
          </span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="bg-transparent text-[13.5px] text-linen outline-none"
          >
            <option value="ALL">{t("badge:status.ALL")}</option>
            {badgeStatuses.map((item) => (
              <option key={item} value={item}>
                {t(`badge:status.${item}`)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <DataBoundary
        isLoading={isLoading}
        isError={isError}
        onRetry={retry}
        isEmpty={badges.length === 0}
        skeleton={<SkeletonText lines={8} className="px-8" />}
        empty={
          <EmptyState
            title={
              filtered ? t("badge:emptyFiltered") : t("badge:empty")
            }
            className="mx-auto max-w-md py-12"
          />
        }
      >
        <div className="mx-5 mb-6 overflow-hidden rounded-sm border border-border bg-gun-950 md:mx-8">
          <table className="w-full border-collapse text-[13.5px]">
            <thead>
              <tr>
                <th className={cn(HEAD, "w-[14%]")}>{t("badge:table.code")}</th>
                <th className={cn(HEAD, "w-[24%]")}>{t("badge:table.employee")}</th>
                <th className={cn(HEAD, "w-[18%]")}>{t("badge:table.department")}</th>
                <th className={cn(HEAD, "w-[14%]")}>{t("badge:table.linkedAt")}</th>
                <th className={cn(HEAD, "w-[12%]")}>{t("badge:table.passCount")}</th>
                <th className={HEAD}>{t("badge:table.status")}</th>
              </tr>
            </thead>
            <tbody>
              {badges.map((badge) => (
                <tr
                  key={badge.id}
                  onClick={() => router.push(`/crachas/${badge.id}`)}
                  className="cursor-pointer border-b border-border last:border-b-0 hover:bg-n800/40"
                >
                  <td className="px-5 py-3 font-mono text-linen">{badge.code}</td>
                  <td className="px-5 py-3 text-linen">
                    {badge.employee?.name ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-n300">{badge.department ?? "—"}</td>
                  <td className="px-5 py-3 font-mono text-n300">
                    {TimeService.shortDate(badge.linkedAt) ?? "—"}
                  </td>
                  <td className="px-5 py-3 font-mono text-n300">{badge.passCount}</td>
                  <td className="px-5 py-3 font-mono text-[11px]">
                    <span
                      className={cn(
                        badge.status === "ACTIVE" && "text-chart",
                        badge.status === "BLOCKED" && "text-cherry",
                        badge.status === "UNASSIGNED" && "text-n400",
                      )}
                    >
                      ● {t(`badge:status.${badge.status}`)}
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
