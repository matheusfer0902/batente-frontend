import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const eyebrowVariants = cva(
  "font-mono text-[10.5px] font-normal uppercase leading-none tracking-[0.16em]",
  {
    variants: {
      tone: {
        moon: "text-moon",
        muted: "text-n600",
        accent: "text-chart",
        warning: "text-sun",
        danger: "text-cherry",
        inherit: "text-current",
      },
    },
    defaultVariants: {
      tone: "moon",
    },
  },
);

export interface EyebrowProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof eyebrowVariants> {}

const Eyebrow = React.forwardRef<HTMLParagraphElement, EyebrowProps>(
  ({ className, tone, ...props }, ref) => (
    <p ref={ref} className={cn(eyebrowVariants({ tone }), className)} {...props} />
  ),
);
Eyebrow.displayName = "Eyebrow";

export { Eyebrow, eyebrowVariants };
