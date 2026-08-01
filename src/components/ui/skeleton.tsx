import * as React from "react";
import { cn } from "@/lib/utils";

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn("h-[11px] rounded-[2px] bg-n800", className)}
      {...props}
    />
  ),
);
Skeleton.displayName = "Skeleton";

/** Larguras irregulares: o esqueleto tem a forma do conteúdo, não um bloco. */
const LINE_WIDTHS = ["38%", "82%", "64%", "74%", "52%", "70%", "44%"] as const;
/** As últimas linhas desbotam — a lista continua além da dobra. */
const LINE_OPACITY = [1, 1, 1, 1, 1, 0.6, 0.35] as const;

export interface SkeletonTextProps
  extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number;
}

const SkeletonText = React.forwardRef<HTMLDivElement, SkeletonTextProps>(
  ({ className, lines = 5, ...props }, ref) => (
    <div
      ref={ref}
      role="status"
      aria-busy="true"
      className={cn("flex flex-col gap-3", className)}
      {...props}
    >
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          style={{
            width: LINE_WIDTHS[index % LINE_WIDTHS.length],
            opacity: LINE_OPACITY[index % LINE_OPACITY.length],
          }}
        />
      ))}
    </div>
  ),
);
SkeletonText.displayName = "SkeletonText";

export { Skeleton, SkeletonText };
