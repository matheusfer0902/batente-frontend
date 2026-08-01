import * as React from "react";
import { cn } from "@/lib/utils";

export type BatenteTone = "accent" | "moon" | "muted";

const MARK_TONES: Record<BatenteTone, { frame: string; bar: string }> = {
  accent: { frame: "fill-linen", bar: "fill-chart" },
  moon: { frame: "fill-linen", bar: "fill-moon" },
  muted: { frame: "fill-n600", bar: "fill-n600" },
};

const WORDMARK_TONES: Record<BatenteTone, string> = {
  accent: "text-chart",
  moon: "text-moon",
  muted: "text-n600",
};

export interface BatenteMarkProps
  extends React.SVGAttributes<SVGSVGElement> {
  size?: number;
  tone?: BatenteTone;
}

/** Símbolo BATENTE: o batente da porta e a folha que bate nele. */
export function BatenteMark({
  size = 34,
  tone = "accent",
  className,
  ...props
}: BatenteMarkProps) {
  const colors = MARK_TONES[tone];

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role="img"
      aria-hidden="true"
      focusable="false"
      className={cn("shrink-0", className)}
      {...props}
    >
      <path
        className={colors.frame}
        fillRule="evenodd"
        d="M6 58 L6 20 Q6 6 20 6 L44 6 Q58 6 58 20 L58 58 Z M16 58 L16 22.5 Q16 16 22.5 16 L41.5 16 Q48 16 48 22.5 L48 58 Z"
      />
      <rect className={colors.bar} x="33" y="16" width="11" height="42" rx="1.5" />
    </svg>
  );
}

export interface BatenteWordmarkProps {
  tone?: BatenteTone;
  markSize?: number;
  className?: string;
  markClassName?: string;
  textClassName?: string;
}

export function BatenteWordmark({
  tone = "accent",
  markSize = 34,
  className,
  markClassName,
  textClassName,
}: BatenteWordmarkProps) {
  return (
    <div className={cn("flex items-center gap-3.5", className)}>
      <BatenteMark size={markSize} tone={tone} className={markClassName} />
      <span
        className={cn(
          "font-display type-wordmark text-2xl leading-none tracking-[-0.01em] text-linen",
          textClassName,
        )}
      >
        BATEN<span className={WORDMARK_TONES[tone]}>T</span>E
      </span>
    </div>
  );
}
