"use client";

import { useTranslation } from "react-i18next";
import { Eyebrow } from "@/components/ui/eyebrow";

export type LandingArea = "inicio" | "portaria";

interface LandingPlaceholderProps {
  area: LandingArea;
}

/**
 * Destino pós-login por papel. O conteúdo real chega nos Blocos 2 (Painel)
 * e 3 (Pessoas) — aqui só existe a rota para o redirecionamento funcionar.
 */
export function LandingPlaceholder({ area }: LandingPlaceholderProps) {
  const { t } = useTranslation("common");

  return (
    <section className="mx-auto flex max-w-2xl flex-col gap-3 py-12">
      <Eyebrow>{t("placeholder.kicker")}</Eyebrow>
      <h1 className="font-display text-3xl font-bold tracking-tight">
        {t(`placeholder.${area}.title`)}
      </h1>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {t(`placeholder.${area}.description`)}
      </p>
    </section>
  );
}
