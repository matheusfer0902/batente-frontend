"use client";

import { useTranslation } from "react-i18next";
import { BatenteWordmark } from "@/components/shared/BatenteLogo";
import { Eyebrow } from "@/components/ui/eyebrow";
import { cn } from "@/lib/utils";

export type BrandPanelTone = "brand" | "contingency";

interface BrandPanelProps {
  /** `contingency` troca o acento amarelo pelo azul de indisponibilidade. */
  tone?: BrandPanelTone;
  className?: string;
}

/**
 * Painel de marca da tela de entrada. Abaixo de 860px vira cabeçalho:
 * mantém logo e manifesto, dispensa o texto de apoio.
 */
export function BrandPanel({ tone = "brand", className }: BrandPanelProps) {
  const { t } = useTranslation("auth");
  const isContingency = tone === "contingency";

  return (
    <section
      className={cn(
        "relative flex flex-col gap-4 overflow-hidden border-b border-border bg-gun-950 p-7",
        "entry:justify-between entry:gap-0 entry:border-b-0 entry:border-r entry:p-11",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0",
          isContingency ? "scanlines-moon" : "scanlines-accent",
        )}
      />

      <BatenteWordmark
        tone={isContingency ? "moon" : "accent"}
        className="relative"
        markClassName="size-7 entry:size-[34px]"
        textClassName="text-xl entry:text-2xl"
      />

      <div className="relative">
        <p className="font-display type-display text-[22px] leading-[1.15] tracking-[-0.01em] text-linen entry:whitespace-pre-line entry:text-[34px] entry:leading-[1.12]">
          {t("entry.brand.headline")}
        </p>
        <div
          className={cn(
            "my-[22px] hidden h-px w-16 entry:block",
            isContingency ? "bg-moon" : "bg-chart",
          )}
        />
        <p className="hidden max-w-[34ch] text-[13.5px] leading-[1.65] text-n400 entry:block">
          {t(
            isContingency
              ? "entry.brand.descriptionOffline"
              : "entry.brand.description",
          )}
        </p>
      </div>

      <Eyebrow tone="muted" className="relative hidden tracking-[0.14em] entry:block">
        {t("entry.brand.caption")}
      </Eyebrow>
    </section>
  );
}
