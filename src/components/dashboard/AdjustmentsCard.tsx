"use client";

import { useTranslation } from "react-i18next";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import type { AdjustmentSummary } from "@/types/timekeeping";
import type { BlockState } from "@/types/ui";

/** Ajustes aguardando análise — pedidos de correção do espelho de ponto. */
export function AdjustmentsCard({
  block,
}: {
  block: BlockState<AdjustmentSummary>;
}) {
  const { t } = useTranslation("dashboard");
  const summary = block.data;
  const count = summary?.count ?? 0;

  return (
    <SummaryCard
      title={t("adjustments.title")}
      value={count}
      valueTone="neutral"
      unit={t("adjustments.unit")}
      description={
        count > 0
          ? t("adjustments.oldest", {
              count: summary?.oldestWaitingDays ?? 0,
            })
          : t("adjustments.clear")
      }
      actionLabel={t("adjustments.action")}
      actionHref="/ajustes"
      isLoading={block.isLoading}
      isError={block.isError}
      onRetry={block.retry}
      errorTitle={t("blockError.title")}
      errorDescription={t("blockError.description")}
    />
  );
}
