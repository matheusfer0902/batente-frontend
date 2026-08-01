"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  /** Linha em mono sob o título: data, cadência de atualização, contexto. */
  subtitle?: ReactNode;
  /** Pílulas e botões à direita. */
  actions?: ReactNode;
  className?: string;
}

/** Topo de cada tela do painel. */
export function PageHeader({
  title,
  subtitle,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-4 border-b border-border px-5 py-4 md:px-8",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="font-display type-title text-xl tracking-[-0.01em] text-linen">
          {title}
        </h1>
        {subtitle ? (
          <div className="mt-1 font-mono text-[11px] text-n400">{subtitle}</div>
        ) : null}
      </div>

      {actions ? (
        <div className="ml-auto flex flex-wrap items-center gap-2.5">{actions}</div>
      ) : null}
    </div>
  );
}
