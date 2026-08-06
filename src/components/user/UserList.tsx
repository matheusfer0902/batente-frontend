"use client";

import { useTranslation } from "react-i18next";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { DataBoundary } from "@/components/shared/DataBoundary";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { SkeletonText } from "@/components/ui/skeleton";
import { useUserList } from "@/hooks/useUserList";
import { TimeService } from "@/services/TimeService";
import { cn } from "@/lib/utils";

const HEAD =
  "border-b border-border px-6 py-2.5 text-left font-mono text-[9.5px] font-medium uppercase tracking-[0.14em] text-moon";

export function UserList() {
  const { t } = useTranslation(["user", "common"]);
  const { users, isLoading, isError, retry } = useUserList();

  return (
    <RoleGuard roles={["ADMIN"]}>
      <>
        <PageHeader
          title={t("user:title")}
          subtitle={t("user:subtitle", { count: users.length })}
          actions={
            <Button variant="default" size="entry" disabled>
              {t("user:create")}
            </Button>
          }
        />

        <DataBoundary
          isLoading={isLoading}
          isError={isError}
          onRetry={retry}
          isEmpty={users.length === 0}
          skeleton={<SkeletonText lines={6} className="p-6" />}
          empty={
            <EmptyState title={t("user:empty")} className="mx-auto max-w-md py-16" />
          }
        >
          <div className="overflow-hidden rounded-sm border border-border bg-gun-950">
            <table className="w-full border-collapse text-[13.5px]">
              <thead>
                <tr>
                  <th className={cn(HEAD, "w-[22%]")}>{t("user:table.name")}</th>
                  <th className={cn(HEAD, "w-[28%]")}>{t("user:table.email")}</th>
                  <th className={cn(HEAD, "w-[16%]")}>{t("user:table.role")}</th>
                  <th className={HEAD}>{t("user:table.lastLoginAt")}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-6 py-3.5 text-linen">{user.name}</td>
                    <td className="px-6 py-3.5 font-mono text-n300">{user.email}</td>
                    <td className="px-6 py-3.5 font-mono text-[11px] text-n400">
                      {t(`user:role.${user.role}`)}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-n300">
                      {user.lastLoginAt
                        ? TimeService.shortDate(user.lastLoginAt)
                        : t("user:neverLoggedIn")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DataBoundary>
      </>
    </RoleGuard>
  );
}
