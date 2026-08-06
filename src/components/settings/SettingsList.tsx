"use client";

import { useTranslation } from "react-i18next";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { DataBoundary } from "@/components/shared/DataBoundary";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { SkeletonText } from "@/components/ui/skeleton";
import { useSettingsList } from "@/hooks/useSettingsList";
import { cn } from "@/lib/utils";

const HEAD =
  "border-b border-border px-6 py-2.5 text-left font-mono text-[9.5px] font-medium uppercase tracking-[0.14em] text-moon";

export function SettingsList() {
  const { t } = useTranslation(["settings", "common"]);
  const { settings, isLoading, isError, retry } = useSettingsList();

  return (
    <RoleGuard roles={["ADMIN"]}>
      <>
        <PageHeader
          title={t("settings:title")}
          subtitle={t("settings:subtitle", { count: settings.length })}
        />

        <DataBoundary
          isLoading={isLoading}
          isError={isError}
          onRetry={retry}
          isEmpty={settings.length === 0}
          skeleton={<SkeletonText lines={8} className="p-6" />}
          empty={
            <EmptyState
              title={t("settings:empty")}
              className="mx-auto max-w-md py-16"
            />
          }
        >
          <div className="overflow-hidden rounded-sm border border-border bg-gun-950">
            <table className="w-full border-collapse text-[13.5px]">
              <thead>
                <tr>
                  <th className={cn(HEAD, "w-[18%]")}>{t("settings:table.category")}</th>
                  <th className={cn(HEAD, "w-[32%]")}>{t("settings:table.label")}</th>
                  <th className={HEAD}>{t("settings:table.value")}</th>
                </tr>
              </thead>
              <tbody>
                {settings.map((setting) => (
                  <tr
                    key={setting.key}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-6 py-3.5 font-mono text-[11px] text-n400">
                      {setting.category}
                    </td>
                    <td className="px-6 py-3.5 text-linen">{setting.label}</td>
                    <td className="px-6 py-3.5 font-mono text-n300">{setting.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-border px-6 py-4 text-xs text-n400">
              {t("settings:note")}
            </div>
          </div>
        </DataBoundary>
      </>
    </RoleGuard>
  );
}
