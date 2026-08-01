"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { AccessService } from "@/services/AccessService";
import { TimeService } from "@/services/TimeService";
import type { AccessEvent } from "@/types/access";
import { cn } from "@/lib/utils";

interface AccessFeedRowProps {
  event: AccessEvent;
  /** A leitura mais recente ganha destaque — é o "chegando agora". */
  isLatest?: boolean;
  /** A última visível desbota: o feed continua além da dobra. */
  isFading?: boolean;
}

export function AccessFeedRow({
  event,
  isLatest = false,
  isFading = false,
}: AccessFeedRowProps) {
  const { t } = useTranslation("access");

  const isGranted = event.decision === "GRANTED";
  const subject = AccessService.subjectLabel(event);
  const outcome = AccessService.outcomeLabel(event);
  const isSynced = AccessService.isSyncedOffline(event);

  return (
    <Link
      href={`/acessos/${event.id}`}
      className={cn(
        "flex flex-wrap items-center gap-x-5 gap-y-2 rounded-sm border bg-gun-950 px-5 py-4 transition-colors",
        !isGranted && "border-cherry/40 border-l-2 border-l-cherry",
        isGranted && isLatest && "border-chart/35 border-l-2 border-l-chart",
        isGranted && !isLatest && "border-border hover:border-moon/45",
        isFading && "opacity-[0.62]",
      )}
    >
      <span className="font-mono text-[22px] tracking-[0.02em] text-n300">
        {TimeService.clock(event.occurredAt)}
      </span>

      <span className="min-w-[200px] flex-1">
        <span
          className={cn(
            "block font-display type-title text-[19px] leading-tight",
            event.employee ? "text-linen" : "text-n400",
          )}
        >
          {t(subject.key, subject.values)}
        </span>
        <span className="mt-1 block font-mono text-[11px] text-n400">
          {AccessService.metaParts(event)
            .map((part) => t(part.key, part.values))
            .join(" · ")}
        </span>
      </span>

      <span className="text-right">
        <span
          className={cn(
            "block font-mono text-xs tracking-[0.1em]",
            isGranted ? "text-chart" : "text-cherry",
          )}
        >
          ● {t(AccessService.decisionLabelKey(event))}
        </span>
        <span
          className={cn(
            "mt-1 block font-mono text-[10.5px]",
            isSynced ? "text-sun" : "text-n400",
          )}
        >
          {t(outcome.key, outcome.values)}
        </span>
      </span>
    </Link>
  );
}
