"use client";

import { clsx } from "clsx";

interface ProgressDotsProps {
  total: number;
  filled: number;
  className?: string;
}

export default function ProgressDots({ total, filled, className }: ProgressDotsProps) {
  return (
    <div className={clsx("flex gap-1", className)}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={clsx(
            "h-2 flex-1 rounded-full transition-colors duration-300",
            i < filled ? "bg-athar-primary" : "bg-gray-200"
          )}
        />
      ))}
    </div>
  );
}
