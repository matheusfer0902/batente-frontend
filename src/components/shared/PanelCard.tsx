import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const panelCardVariants = cva(
  "flex flex-col rounded-sm border bg-gun-950 p-[22px]",
  {
    variants: {
      tone: {
        default: "border-border",
        /** Contingência: a informação mudou, mas nada quebrou. */
        contingency: "border-moon/45 border-l-2 border-l-moon",
        /** Falha real deste bloco — os vizinhos seguem intactos. */
        danger: "border-cherry/40 border-l-2 border-l-cherry",
      },
    },
    defaultVariants: {
      tone: "default",
    },
  },
);

export interface PanelCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof panelCardVariants> {}

/** Bloco do painel. Cada um carrega seus próprios dados e falha sozinho. */
const PanelCard = React.forwardRef<HTMLDivElement, PanelCardProps>(
  ({ className, tone, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(panelCardVariants({ tone }), className)}
      {...props}
    />
  ),
);
PanelCard.displayName = "PanelCard";

export { PanelCard, panelCardVariants };
