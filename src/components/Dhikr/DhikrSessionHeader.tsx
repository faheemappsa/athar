import type { DhikrCategory } from "../../data/adhkar";

type DhikrSessionHeaderProps = {
  emoji: string;
  title: string;
  category: DhikrCategory;
  currentIndex: number;
  totalCount: number;
  progress: number;
};

const SESSION_COPY: Record<DhikrCategory, string> = {
  morning: "بداية يومك",
  evening: "سكينة مسائك",
  sleep: "نم بقلب مطمئن",
};

export default function DhikrSessionHeader({
  emoji,
  title,
  category,
  currentIndex,
  totalCount,
  progress,
}: DhikrSessionHeaderProps) {
  return (
    <div className="rounded-[28px] border border-white/70 bg-primary-bg/70 p-3 shadow-sm ring-1 ring-action/5 backdrop-blur">
      <div className="flex items-center justify-between gap-3 text-sm font-bold">
        <span className="text-action">
          {emoji} {title}
        </span>
        <span className="text-secondary-text">{SESSION_COPY[category]}</span>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/70">
          <div className="h-full rounded-full bg-action transition-all duration-300" style={{ width: `${Math.min(100, progress)}%` }} />
        </div>
        <span className="shrink-0 text-xs font-extrabold text-secondary-text">
          {currentIndex + 1} من {totalCount}
        </span>
      </div>
    </div>
  );
}
