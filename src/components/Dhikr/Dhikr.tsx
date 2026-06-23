import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getMorningDhikr, getEveningDhikr, getSleepDhikr } from "../../services/dhikrApi";

type DhikrItem = { text: string; count: number; source?: string };

const FALLBACK_DHIKR: DhikrItem[] = [
  { text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", count: 33 },
  { text: "الْحَمْدُ لِلَّهِ", count: 33 },
  { text: "اللَّهُ أَكْبَرُ", count: 34 },
];

function normalizeDhikr(data: unknown): DhikrItem[] {
  const raw = Array.isArray(data) ? data : Array.isArray((data as { data?: unknown[] })?.data) ? (data as { data: unknown[] }).data : [];

  return raw
    .map((item) => {
      const value = item as { text?: string; zekr?: string; content?: string; count?: number | string; repeat?: number | string; source?: string };
      const text = value.text || value.zekr || value.content || "";
      const countValue = Number(value.count || value.repeat || 1);
      return {
        text,
        count: Number.isFinite(countValue) && countValue > 0 ? countValue : 1,
        source: value.source,
      };
    })
    .filter((item) => item.text.trim().length > 0);
}

export default function Dhikr() {
  const [dhikrList, setDhikrList] = useState<DhikrItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [feedback, setFeedback] = useState<"idle" | "success" | "complete">("idle");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const hour = new Date().getHours();
    let fetchFn: () => Promise<unknown>;
    if (hour >= 5 && hour < 12) fetchFn = getMorningDhikr;
    else if (hour >= 17 && hour < 20) fetchFn = getEveningDhikr;
    else if (hour >= 23 || hour < 5) fetchFn = getSleepDhikr;
    else fetchFn = getMorningDhikr;

    setLoading(true);
    fetchFn()
      .then((data) => {
        if (!mounted) return;
        const normalized = normalizeDhikr(data);
        setDhikrList(normalized.length > 0 ? normalized : FALLBACK_DHIKR);
        setCurrentIndex(0);
        setCount(0);
        setFeedback("idle");
      })
      .catch(() => {
        if (!mounted) return;
        setDhikrList(FALLBACK_DHIKR);
        setCurrentIndex(0);
        setCount(0);
        setFeedback("idle");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="w-full rounded-card bg-white p-6 text-center text-secondary-text shadow-xl"
      >
        جاري التحميل...
      </motion.div>
    );
  }

  const current = dhikrList[currentIndex] || FALLBACK_DHIKR[0];
  const safeCount = Math.max(1, current.count || 1);
  const isComplete = count >= safeCount;

  const handleTap = () => {
    if (isComplete) return;

    if (navigator.vibrate) navigator.vibrate(10);

    const newCount = Math.min(count + 1, safeCount);
    setCount(newCount);

    if (newCount === safeCount) {
      setFeedback("complete");
      setTimeout(() => {
        if (currentIndex + 1 < dhikrList.length) {
          setCurrentIndex(currentIndex + 1);
          setCount(0);
          setFeedback("idle");
        } else {
          setFeedback("complete");
        }
      }, 900);
    } else {
      setFeedback("success");
      setTimeout(() => setFeedback("idle"), 220);
    }
  };

  const progressPercent = Math.min(100, (count / safeCount) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="w-full overflow-hidden rounded-card bg-white p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
    >
      <h2 className="mb-2 text-lg font-bold text-primary-text">الأذكار اليومية</h2>
      <p className="mb-4 text-sm text-secondary-text">{currentIndex + 1} / {dhikrList.length}</p>

      <p className="break-words text-xl font-semibold leading-loose text-primary-text">{current.text}</p>
      <p className="mt-2 text-sm text-secondary-text">التكرار: {safeCount}</p>

      <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-primary-bg">
        <div className="h-full rounded-full bg-action transition-all duration-300" style={{ width: `${progressPercent}%` }} />
      </div>

      <p className="mt-4 text-center text-2xl font-bold text-action">{count} / {safeCount}</p>

      <button
        onClick={handleTap}
        disabled={isComplete}
        className={`mt-4 w-full rounded-full py-3 text-base font-semibold text-white shadow-md transition-all duration-200 ${
          isComplete
            ? "bg-secondary-text cursor-not-allowed"
            : feedback === "complete"
            ? "bg-highlight scale-105"
            : feedback === "success"
            ? "bg-action scale-95"
            : "bg-action hover:opacity-90"
        }`}
      >
        {isComplete ? "تم" : feedback === "complete" ? "أتممت" : feedback === "success" ? "جميل" : "اضغط للتسبيح"}
      </button>

      {isComplete && currentIndex + 1 >= dhikrList.length && (
        <p className="mt-3 text-center text-sm font-semibold text-highlight">أتممت أذكارك اليومية</p>
      )}
    </motion.div>
  );
}
