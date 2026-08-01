"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { DataBoundary } from "@/components/shared/DataBoundary";
import { EmptyState } from "@/components/shared/EmptyState";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SkeletonText } from "@/components/ui/skeleton";
import { AccessService } from "@/services/AccessService";
import { TimeService } from "@/services/TimeService";
import type { AccessEvent } from "@/types/access";
import type { BlockState } from "@/types/ui";
import { cn } from "@/lib/utils";

const HEAD_CELL =
  "border-b border-border px-5 py-2.5 text-left font-mono text-[9.5px] font-medium uppercase tracking-[0.14em] text-moon";
const CELL = "px-5 py-3";

function DecisionCell({ event }: { event: AccessEvent }) {
  const { t } = useTranslation("access");
  const isGranted = event.decision === "GRANTED";

  return (
    <span className="font-mono text-[11px]">
      <span className={isGranted ? "text-chart" : "text-cherry"}>
        ● {t(AccessService.decisionDetailKey(event))}
      </span>
      {AccessService.isSyncedOffline(event) ? (
        <span className="ml-2 text-[10px] text-sun">
          ↻ {t("table.synced")}
        </span>
      ) : null}
    </span>
  );
}

/** Últimos acessos — a amostra que leva ao monitor. */
export function LatestAccessTable({
  block,
}: {
  block: BlockState<AccessEvent[]>;
}) {
  const { t } = useTranslation("access");
  const events = block.data ?? [];

  return (
    <section className="overflow-hidden rounded-sm border border-border bg-gun-950">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <Eyebrow>{t("latest.title")}</Eyebrow>
        <Link
          href="/monitor"
          className="font-mono text-[10.5px] text-n400 transition-colors hover:text-linen"
        >
          {t("latest.openMonitor")}
        </Link>
      </div>

      <DataBoundary
        isLoading={block.isLoading}
        isError={block.isError}
        isEmpty={events.length === 0}
        onRetry={block.retry}
        skeleton={<SkeletonText className="p-5" lines={5} />}
        empty={
          <EmptyState
            className="py-10"
            title={t("latest.empty.title")}
            description={t("latest.empty.description")}
          />
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                <th className={cn(HEAD_CELL, "w-[13%]")}>{t("table.time")}</th>
                <th className={cn(HEAD_CELL, "w-[30%]")}>
                  {t("table.employee")}
                </th>
                <th className={cn(HEAD_CELL, "w-[15%]")}>{t("table.badge")}</th>
                <th className={cn(HEAD_CELL, "w-[13%]")}>{t("table.mode")}</th>
                <th className={HEAD_CELL}>{t("table.decision")}</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event, index) => (
                <tr
                  key={event.id}
                  className={cn(index < events.length - 1 && "border-b border-border")}
                >
                  <td className={cn(CELL, "font-mono text-n300")}>
                    {TimeService.clock(event.occurredAt)}
                  </td>
                  <td
                    className={cn(CELL, event.employee ? "text-linen" : "text-n400")}
                  >
                    {event.employee?.name ?? t("subject.unknownBadge")}
                  </td>
                  <td className={cn(CELL, "font-mono text-n400")}>
                    {event.badgeCode}
                  </td>
                  <td className={cn(CELL, "font-mono text-[11px]")}>
                    <span
                      className={
                        event.mode === "ONLINE" ? "text-n400" : "text-moon"
                      }
                    >
                      {t(`mode.${event.mode}`)}
                    </span>
                  </td>
                  <td className={CELL}>
                    <DecisionCell event={event} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataBoundary>
    </section>
  );
}
