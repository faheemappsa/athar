"use client";

import { clsx } from "clsx";

interface PrayerChipProps {
  name: string;
  time: string;
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
        "flex-shrink-0 flex flex-col items-center gap-0.5 p-2 rounded-xl w-[68px] transition-all duration-200 active:scale-95",
        isActive
          ? "bg-athar-primary text-white shadow-md dark:shadow-athar-primary/20"
          : "bg-white dark:bg-gray-700 text-athar-text dark:text-gray-200 ring-1 ring-athar-primary/10 dark:ring-gray-600 shadow-sm hover:shadow-md"
      )}
    >
      <span className="text-base">{icon}</span>
      <span className="text-[0.65rem] font-medium leading-tight">{name}</span>
      <span className="text-sm font-bold leading-tight">
        {display}
        <span className={clsx("text-[0.6rem] ml-0.5", isActive ? "opacity-80" : "opacity-50")}>{period}</span>
      </span>
    </button>
  );
}
