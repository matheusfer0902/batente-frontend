"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import type { AccessTimelineStep, AccessTimelineTone } from "@/types/access";
import { cn } from "@/lib/utils";

const DOT_TONE: Record<AccessTimelineTone, string> = {
  done: "bg-chart",
  denied: "bg-cherry",
  muted: "bg-n600",
};

/** "O que aconteceu": a decisão do totem, passo a passo. */
export function AccessTimeline({ steps }: { steps: AccessTimelineStep[] }) {
  const { t } = useTranslation("access");

  return (
    <ol className="flex flex-col">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;

        return (
          <li key={step.id} className="flex gap-4">
            <div className="flex shrink-0 flex-col items-center">
              <span
                aria-hidden="true"
                className={cn("size-[11px] rounded-full", DOT_TONE[step.tone])}
              />
              {!isLast ? (
                <span aria-hidden="true" className="w-px flex-1 bg-moon/35" />
              ) : null}
            </div>

            <div className={cn(!isLast && "pb-[26px]")}>
              <p
                className={cn(
                  "mb-1.5 text-[14.5px] font-medium",
                  step.tone === "muted" ? "text-n300" : "text-linen",
                )}
              >
                {t(step.titleKey)}
              </p>
              <p className="text-[13px] leading-[1.55] text-n400">
                {t(step.bodyKey, step.bodyValues)}
              </p>
              {step.linkKey && step.href ? (
                <Link
                  href={step.href}
                  className="mt-2 inline-block font-mono text-[11px] text-chart transition-colors hover:text-linen"
                >
                  {t(step.linkKey)}
                </Link>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
