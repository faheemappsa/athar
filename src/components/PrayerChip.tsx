
```typescript
"use client";

import { clsx } from "clsx";

interface PrayerChipProps {
  name: string;
  time: string; // بصيغة HH:mm (24 ساعة)
  icon: string;
  isActive?: boolean;
  onClick?: () => void;
}

function formatTime12(time: string): { display: string; period: string } {
  const [h, m] = time.split(":").map(Number);
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const period = h < 12 ? "ص" : "م";
  return {
    display: `${hour12}:${String(m).padStart(2, "0")}`,
    period,
  };
}

export default function PrayerChip({ name, time, icon, isActive = false, onClick }: PrayerChipProps) {
  const { display, period } = formatTime12(time);

  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex-shrink-0 flex flex-col items-center gap-1 p-3 rounded-xl min-w-[70px] transition-all duration-200 active:scale-95",
        isActive
          ? "bg-athar-primary text-white shadow-md dark:shadow-athar-primary/20"
          : "bg-white dark:bg-gray-700 text-athar-text dark:text-gray-200 ring-1 ring-athar-primary/10 dark:ring-gray-600 shadow-sm hover:shadow-md"
      )}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-xs font-medium">{name}</span>
      <span className="text-sm font-bold">
        {display}
        <span className={clsx("text-xs ml-0.5", isActive ? "opacity-80" : "opacity-50")}>{period}</span>
      </span>
    </button>
  );
}
