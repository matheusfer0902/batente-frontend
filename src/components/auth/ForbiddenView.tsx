"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { BatenteMark } from "@/components/shared/BatenteLogo";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";

/**
 * Estado 403. Informa o limite de acesso sem revelar qual papel seria
 * necessário para alcançar a página.
 */
export function ForbiddenView() {
  const { t } = useTranslation("auth");
  const { landingRoute, isAuthenticated, logout } = useAuth();

  return (
    <div className="relative flex w-full max-w-[1000px] items-center justify-center overflow-hidden rounded-sm border border-border bg-gun px-6 py-16 entry:min-h-[600px] entry:p-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 scanlines-fine"
      />

      <div className="relative flex max-w-[460px] flex-col items-center text-center">
        <BatenteMark size={72} tone="muted" className="mb-7" />

        <Eyebrow className="mb-3.5">{t("forbidden.kicker")}</Eyebrow>

        <h1 className="mb-3.5 font-display text-[28px] leading-[1.1] tracking-[-0.01em] text-linen [font-variation-settings:'wdth'_100,'wght'_800] entry:text-[34px]">
          {t("forbidden.title")}
        </h1>

        <p className="mb-8 text-pretty text-sm leading-[1.65] text-n400">
          {t("forbidden.description")}
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild variant="brand" size="entryInline">
            <Link href={landingRoute}>{t("forbidden.actions.home")}</Link>
          </Button>
          {isAuthenticated ? (
            <Button
              type="button"
              variant="quiet"
              size="entryInline"
              onClick={() => void logout()}
            >
              {t("forbidden.actions.signOut")}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
