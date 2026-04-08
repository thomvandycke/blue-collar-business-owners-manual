import * as React from "react";

import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "default" | "muted" | "success" | "warning" | "danger";
};

export function Badge({ className, tone = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        tone === "default" && "border-transparent bg-accent-soft text-accent-primary",
        tone === "muted" && "border-border-subtle bg-surface-2 text-text-secondary",
        tone === "success" && "border-transparent bg-[rgba(39,174,96,0.2)] text-success",
        tone === "warning" && "border-transparent bg-[rgba(242,201,76,0.2)] text-warning",
        tone === "danger" && "border-transparent bg-[rgba(235,87,87,0.2)] text-danger",
        className,
      )}
      {...props}
    />
  );
}
