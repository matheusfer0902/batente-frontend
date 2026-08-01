"use client";

import { useTranslation } from "react-i18next";
import { DataBoundary } from "@/components/shared/DataBoundary";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SkeletonText } from "@/components/ui/skeleton";
import type { AccessStats } from "@/types/access";
import type { BlockState } from "@/types/ui";
import { cn } from "@/lib/utils";

interface StatCellProps {
  label: string;
  value: number;
  tone: "default" | "granted" | "denied" | "offline";
}

const VALUE_TONE: Record<StatCellProps["tone"], string> = {
  default: "text-linen",
  granted: "text-chart",
  denied: "text-cherry",
  offline: "text-moon",
};

function StatCell({ label, value, tone }: StatCellProps) {
  return (
    <div className="bg-gun px-5 py-4 md:px-6">
      <Eyebrow
        tone="inherit"
        className="mb-1.5 text-[9.5px] tracking-[0.14em] text-n400"
      >
        {label}
      </Eyebrow>
      <p className={cn("font-mono text-xl", VALUE_TONE[tone])}>{value}</p>
    </div>
  );
}

/** Contagem do dia. Barrados e offline ficam separados: são leituras distintas. */
export function AccessStatsStrip({ block }: { block: BlockState<AccessStats> }) {
  const { t } = useTranslation("access");
  const stats = block.data;

  return (
    <DataBoundary
      isLoading={block.isLoading}
      isError={block.isError}
      onRetry={block.retry}
      skeleton={<SkeletonText className="border-b border-border p-5" lines={2} />}
    >
      {stats ? (
        <div className="grid grid-cols-2 gap-px border-b border-border bg-border md:grid-cols-4">
          <StatCell label={t("stats.today")} value={stats.total} tone="default" />
          <StatCell
            label={t("stats.granted")}
            value={stats.granted}
            tone="granted"
          />
          <StatCell label={t("stats.denied")} value={stats.denied} tone="denied" />
          <StatCell
            label={t("stats.offline")}
            value={stats.offline}
            tone="offline"
          />
        </div>
      ) : null}
    </DataBoundary>
  );
}
