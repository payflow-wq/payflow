import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type BadgeTone = "neutral" | "success" | "warning" | "danger";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const toneStyles: Record<BadgeTone, string> = {
  neutral: "bg-background text-ink-muted border-border",
  success: "bg-brand-50 text-brand-700 border-brand-100",
  warning: "bg-amber-100 text-amber-600 border-amber-100",
  danger: "bg-danger-100 text-danger-600 border-danger-100",
};

export function Badge({ tone = "neutral", className, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium",
        toneStyles[tone],
        className
      )}
      {...rest}
    />
  );
}
