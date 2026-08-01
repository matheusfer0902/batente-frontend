"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { DataBoundary } from "@/components/shared/DataBoundary";
import { ErrorState } from "@/components/shared/ErrorState";
import { PanelCard } from "@/components/shared/PanelCard";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SkeletonText } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type SummaryTone = "neutral" | "warning" | "positive";

interface SummaryCardProps {
  title: string;
  /** Número grande — a resposta da pergunta "o que preciso resolver hoje?". */
  value: ReactNode;
  valueTone?: SummaryTone;
  /** Complemento na mesma linha do número. */
  unit: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  errorTitle: string;
  errorDescription: string;
}

const VALUE_TONE: Record<SummaryTone, string> = {
  neutral: "text-linen",
  warning: "text-sun",
  positive: "text-chart",
};

/** Cartão de contagem do Início: número, leitura em uma frase e a saída. */
export function SummaryCard({
  title,
  value,
  valueTone = "neutral",
  unit,
  description,
  actionLabel,
  actionHref,
  isLoading,
  isError,
  onRetry,
  errorTitle,
  errorDescription,
}: SummaryCardProps) {
  return (
    <PanelCard
      tone={isError ? "danger" : "default"}
      className="min-h-[220px] justify-between"
    >
      <Eyebrow tone={isError ? "danger" : "moon"}>{title}</Eyebrow>

      <DataBoundary
        isLoading={isLoading}
        isError={isError}
        onRetry={onRetry}
        skeleton={<SkeletonText className="my-5" lines={3} />}
        error={
          <ErrorState
            className="items-start p-0 py-5 text-left"
            title={errorTitle}
            description={errorDescription}
            onRetry={onRetry}
          />
        }
      >
        <>
          <div className="mb-1.5 mt-[18px] flex items-baseline gap-2.5">
            <span
              className={cn(
                "font-display type-action text-[46px] leading-none",
                VALUE_TONE[valueTone],
              )}
            >
              {value}
            </span>
            <span className="text-[13.5px] text-n400">{unit}</span>
          </div>
          <p className="mb-4 text-[12.5px] leading-[1.6] text-n400">
            {description}
          </p>
          <Button asChild variant="quiet" size="entry" className="mt-auto">
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        </>
      </DataBoundary>
    </PanelCard>
  );
}
