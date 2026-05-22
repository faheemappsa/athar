"use client";

import { clsx } from "clsx";

interface PrayerChipProps {
  name: string;
  time: string; // بصيغة HH:mm (24 ساعة)
  icon: string;
  isActive?: boolean;
  onClick?: () => void;
}

function getPeriod(time: string): string {
  const hour = parseInt(time.split(":")[0], 10);
  return hour < 12 ? "ص" : "م";
}

export default function PrayerChip({ name, time, icon, isActive = false, onClick }: PrayerChipProps) {
  const period = getPeriod(time);

  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex-shrink-0 flex flex-col items-center gap-1 p-3 rounded-xl min-w-[70px] transition-all duration-200 active:scale-95",
        isActive
          ? "bg-athar-primary text-white shadow-md"
          : "bg-athar-bg text-athar-text hover:bg-athar-primary/10"
      )}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-xs font-medium">{name}</span>
      <span className="text-sm font-bold">
        {time}
        <span className="text-xs ml-0.5 opacity-70">{period}</span>
      </span>
    </button>
  );
}
