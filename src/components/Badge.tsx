"use client";

import { clsx } from "clsx";

interface BadgeProps {
  label: string;
  variant?: "default" | "accent" | "muted";
  className?: string;
}

export default function Badge({ label, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium",
        {
          "bg-athar-bg text-athar-muted": variant === "default",
          "bg-athar-accent/20 text-athar-accent": variant === "accent",
          "bg-athar-primary/10 text-athar-primary": variant === "muted",
        },
        className
      )}
    >
      {label}
    </span>
  );
}
