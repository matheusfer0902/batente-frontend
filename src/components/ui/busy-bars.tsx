import * as React from "react";
import { cn } from "@/lib/utils";

const BAR_DELAYS_MS = [0, 160, 320] as const;

export type BusyBarsProps = React.HTMLAttributes<HTMLSpanElement>;

/** Indicador de atividade em três barras — vocabulário visual do totem. */
const BusyBars = React.forwardRef<HTMLSpanElement, BusyBarsProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn("flex items-center gap-1", className)}
      {...props}
    >
      {BAR_DELAYS_MS.map((delay) => (
        <span
          key={delay}
          data-batente-bar=""
          className="block h-3.5 w-[5px] bg-chart animate-[batente-bar_1.1s_ease-in-out_infinite]"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  ),
);
BusyBars.displayName = "BusyBars";

export { BusyBars };
