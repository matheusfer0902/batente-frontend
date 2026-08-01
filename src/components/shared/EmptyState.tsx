"use client";

import type { ReactNode } from "react";
import { BatenteMark } from "@/components/shared/BatenteLogo";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  /** Botão de saída — cadastrar, limpar filtros, abrir dispositivo. */
  action?: ReactNode;
  /** A marca some no vazio por filtro: ali o assunto é a busca, não a tela. */
  showMark?: boolean;
  /** Substitui a marca (ex.: o traço "— · —" de "sem movimento"). */
  icon?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  showMark = true,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center",
        className,
      )}
    >
      {icon ?? (showMark ? <BatenteMark size={42} tone="muted" /> : null)}
      <p className="font-display type-title text-base text-linen">{title}</p>
      {description ? (
        <p className="max-w-[38ch] text-[12.5px] leading-[1.6] text-n400">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-1.5">{action}</div> : null}
    </div>
  );
}
