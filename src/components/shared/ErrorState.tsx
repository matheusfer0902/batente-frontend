"use client";

import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  /** Padrão: "O servidor não respondeu". */
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * Falha de um bloco. Diz o que aconteceu, garante que nada foi perdido e
 * oferece a saída — nunca deixa a pessoa sem próximo passo.
 */
export function ErrorState({
  title,
  description,
  onRetry,
  className,
}: ErrorStateProps) {
  const { t } = useTranslation("common");

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-2.5 p-6 text-center",
        className,
      )}
    >
      <p className="font-display type-title text-[15px] text-linen">
        {title ?? t("states.error.title")}
      </p>
      <p className="max-w-[38ch] text-xs leading-[1.55] text-n400">
        {description ?? t("states.error.description")}
      </p>
      {onRetry ? (
        <Button
          type="button"
          variant="danger-outline"
          size="entryInline"
          className="mt-1"
          onClick={onRetry}
        >
          {t("states.error.retry")}
        </Button>
      ) : null}
    </div>
  );
}
