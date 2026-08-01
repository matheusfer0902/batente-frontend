"use client";

import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

/**
 * Bloco sem permissão. Não revela qual papel seria necessário — mesma regra
 * da tela 403.
 */
export function ForbiddenState({ className }: { className?: string }) {
  const { t } = useTranslation("common");

  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-2.5 p-6 text-center",
        className,
      )}
    >
      <p className="font-display type-title text-[15px] text-linen">
        {t("states.forbidden.title")}
      </p>
      <p className="max-w-[38ch] text-xs leading-[1.55] text-n400">
        {t("states.forbidden.description")}
      </p>
    </div>
  );
}
