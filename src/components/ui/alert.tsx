import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { eyebrowVariants } from "@/components/ui/eyebrow";

const alertVariants = cva("rounded-sm border border-l-2 p-4", {
  variants: {
    variant: {
      danger:
        "[--alert-accent:var(--cherry)] border-cherry/40 border-l-cherry bg-cherry/10",
      warning:
        "[--alert-accent:var(--sun)] border-sun/40 border-l-sun bg-sun/10",
      info: "[--alert-accent:var(--moon)] border-moon/35 border-l-moon bg-n800",
    },
  },
  defaultVariants: {
    variant: "info",
  },
});

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  ),
);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      eyebrowVariants({ tone: "inherit" }),
      "text-[color:var(--alert-accent)]",
      className,
    )}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertBody = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm leading-[1.55] text-linen", className)}
    {...props}
  />
));
AlertBody.displayName = "AlertBody";

export { Alert, AlertTitle, AlertBody, alertVariants };
