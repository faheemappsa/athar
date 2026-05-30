"use client";

import { clsx } from "clsx";
import { Sunrise, Sun, Cloud, Moon, Stars, Coffee, Sparkles } from "lucide-react";

interface PrayerChipProps {
  name: string;
  time: string;
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

// تعيين الأيقونة تلقائياً حسب اسم الصلاة
function getPrayerIcon(name: string) {
  const iconMap: Record<string, any> = {
    الفجر: Sunrise,
    الشروق: Sun,
    الظهر: Sun,
    العصر: Cloud,
    المغرب: Moon,
    العشاء: Stars,
    الضحى: Coffee,
  };
  const Icon = iconMap[name] || Sparkles;
  return <Icon className="w-5 h-5" />;
}

export default function PrayerChip({ name, time, isActive = false, onClick }: PrayerChipProps) {
  const { display, period } = formatTime12(time);

  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-xl w-[72px] transition-all duration-200 active:scale-95",
        isActive
          ? "bg-athar-accent-500 text-white shadow-md dark:shadow-athar-accent-500/20"
          : "bg-white dark:bg-gray-800 text-athar-text dark:text-gray-200 ring-1 ring-athar-primary/10 dark:ring-gray-600 shadow-sm hover:shadow-md"
      )}
    >
      <span className="text-athar-accent-600 dark:text-athar-accent-400">{getPrayerIcon(name)}</span>
      <span className="text-[0.65rem] font-medium leading-tight">{name}</span>
      <span className="text-sm font-bold leading-tight">
        {display}
        <span className={clsx("text-[0.6rem] mr-0.5", isActive ? "opacity-90" : "opacity-60")}>{period}</span>
      </span>
    </button>
  );
}
