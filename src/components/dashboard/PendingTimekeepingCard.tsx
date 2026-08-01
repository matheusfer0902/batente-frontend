"use client";

import { useTranslation } from "react-i18next";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import type { PendingSummary } from "@/types/timekeeping";
import type { BlockState } from "@/types/ui";

/** Pendências de ponto: dias que precisam de decisão antes do fechamento. */
export function PendingTimekeepingCard({
  block,
}: {
  block: BlockState<PendingSummary>;
}) {
  const { t } = useTranslation("dashboard");
  const summary = block.data;
  const hasPending = (summary?.days ?? 0) > 0;

  return (
    <SummaryCard
      title={t("pending.title")}
      value={summary?.days ?? 0}
      valueTone={hasPending ? "warning" : "positive"}
      unit={t(hasPending ? "pending.unit" : "pending.unitEmpty")}
      description={
        hasPending
          ? t("pending.blocking", {
              count: summary?.blockingClosure ?? 0,
              period: summary?.periodLabel ?? "",
            })
          : t("pending.clear", { period: summary?.periodLabel ?? "" })
      }
      actionLabel={t(hasPending ? "pending.action" : "pending.actionEmpty")}
      actionHref={hasPending ? "/pendencias" : "/fechamento"}
      isLoading={block.isLoading}
      isError={block.isError}
      onRetry={block.retry}
      errorTitle={t("blockError.title")}
      errorDescription={t("blockError.description")}
    />
  );
}
