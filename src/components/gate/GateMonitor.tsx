"use client";

import { useTranslation } from "react-i18next";
import { DataBoundary } from "@/components/shared/DataBoundary";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { SkeletonText } from "@/components/ui/skeleton";
import { useGateMonitor } from "@/hooks/useGateMonitor";
import { TimeService } from "@/services/TimeService";
import { cn } from "@/lib/utils";

const HEAD =
  "border-b border-border px-5 py-2.5 text-left font-mono text-[9.5px] font-medium uppercase tracking-[0.14em] text-moon";

export function GateMonitor() {
  const { t } = useTranslation(["gate", "common"]);
  const {
    queue,
    credentials,
    deviceOnline,
    isLoading,
    isError,
    retry,
  } = useGateMonitor();

  return (
    <>
      <PageHeader
        title={t("gate:title")}
        subtitle={t("gate:subtitle")}
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" size="entry" disabled>
              {t("gate:actions.release")}
            </Button>
            <Button variant="default" size="entry" disabled>
              {t("gate:actions.block")}
            </Button>
          </div>
        }
      />

      <div className="mx-5 mb-4 flex items-center gap-3 rounded-sm border border-border bg-gun-950 px-5 py-4 md:mx-8">
        <span
          className={cn(
            "size-2.5 rounded-full",
            deviceOnline ? "bg-chart" : "bg-cherry",
          )}
          aria-hidden
        />
        <span
          className={cn(
            "font-mono text-[11px] uppercase tracking-[0.14em]",
            deviceOnline ? "text-chart" : "text-cherry",
          )}
        >
          {deviceOnline ? t("gate:deviceOnline") : t("gate:deviceOffline")}
        </span>
      </div>

      <DataBoundary
        isLoading={isLoading}
        isError={isError}
        onRetry={retry}
        isEmpty={queue.length === 0 && credentials.length === 0}
        skeleton={<SkeletonText lines={8} className="px-8" />}
        empty={
          <EmptyState title={t("gate:emptyQueue")} className="mx-auto max-w-md py-12" />
        }
      >
        <div className="grid gap-6 px-5 pb-8 md:grid-cols-[1fr_320px] md:px-8">
          <section>
            <h2 className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-moon">
              {t("gate:queueTitle")}
            </h2>
            {queue.length === 0 ? (
              <EmptyState title={t("gate:emptyQueue")} className="py-8" />
            ) : (
              <div className="flex flex-col gap-3">
                {queue.map((entry, index) => (
                  <div
                    key={entry.id}
                    className={cn(
                      "flex items-center gap-8 rounded-sm border bg-gun-950 px-8 py-6",
                      index === 0
                        ? "border-chart/40 border-l-2 border-l-chart"
                        : "border-border",
                    )}
                  >
                    <span
                      className={cn(
                        "font-mono text-4xl leading-none",
                        index === 0 ? "text-chart" : "text-n300",
                      )}
                    >
                      {TimeService.shortClock(entry.occurredAt) ?? "—"}
                    </span>
                    <span className="font-display text-2xl font-bold text-linen">
                      {entry.employeeName}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-moon">
              {t("gate:credentialsTitle")}
            </h2>
            {credentials.length === 0 ? (
              <EmptyState title={t("gate:emptyCredentials")} className="py-8" />
            ) : (
              <div className="overflow-hidden rounded-sm border border-border bg-gun-950">
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr>
                      <th className={HEAD}>{t("gate:table.code")}</th>
                      <th className={HEAD}>{t("gate:table.status")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {credentials.map((credential) => (
                      <tr
                        key={credential.id}
                        className="border-b border-border last:border-b-0"
                      >
                        <td className="px-5 py-3 font-mono text-linen">
                          {credential.code}
                        </td>
                        <td className="px-5 py-3 font-mono text-[11px]">
                          <span
                            className={cn(
                              credential.status === "ACTIVE"
                                ? "text-chart"
                                : "text-cherry",
                            )}
                          >
                            ● {t(`gate:credentialStatus.${credential.status}`)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </DataBoundary>
    </>
  );
}
