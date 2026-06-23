import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ADHKAR, CATEGORY_LABELS, type DhikrCategory, type DhikrMode } from "../../data/adhkar";
import { useGeolocation } from "../../hooks/useGeolocation";
import { getPrayerTimes } from "../../services/prayerApi";

const getFallbackCategory = (): DhikrCategory => {
  const hour = new Date().getHours();
  if (hour >= 23 || hour < 5) return "sleep";
  if (hour >= 15 && hour < 23) return "evening";
  return "morning";
};

const parseTime = (time: string) => {
  const clean = time.split(" ")[0];
  const [hours, minutes] = clean.split(":").map(Number);
  const date = new Date();
  date.setHours(hours || 0, minutes || 0, 0, 0);
  return date;
};

export default function Dhikr() {
  const { location } = useGeolocation();
  const [category, setCategory] = useState<DhikrCategory>(getFallbackCategory);
  const [mode, setMode] = useState<DhikrMode>("full");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [feedback, setFeedback] = useState<"idle" | "success" | "complete">("idle");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    const resolveCategory = async () => {
      try {
        if (!location) {
          setCategory(getFallbackCategory());
          return;
        }

        const timings = await getPrayerTimes(location.lat, location.lng);
        if (!mounted) return;

        const now = new Date();
        const fajr = parseTime(timings.Fajr);
        const asr = parseTime(timings.Asr);
        const sleepStart = new Date();
        sleepStart.setHours(23, 0, 0, 0);

        if (now >= sleepStart || now < fajr) setCategory("sleep");
        else if (now >= asr) setCategory("evening");
        else setCategory("morning");
      } catch {
        if (mounted) setCategory(getFallbackCategory());
      } finally {
        if (mounted) setLoaded(true);
      }
    };

    resolveCategory();

    return () => {
      mounted = false;
    };
  }, [location]);

  const dhikrList = useMemo(() => {
    const all = ADHKAR[category];
    return mode === "brief" ? all.filter((item) => item.mode === "brief") : all;
  }, [category, mode]);

  const progressKey = `athar-dhikr-${category}-${mode}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(progressKey);
      if (saved) {
        const parsed = JSON.parse(saved) as { index?: number; count?: number };
        setCurrentIndex(Math.min(parsed.index || 0, Math.max(dhikrList.length - 1, 0)));
        setCount(parsed.count || 0);
      } else {
        setCurrentIndex(0);
        setCount(0);
      }
      setFeedback("idle");
    } catch {
      setCurrentIndex(0);
      setCount(0);
    }
  }, [progressKey, dhikrList.length]);

  useEffect(() => {
    localStorage.setItem(progressKey, JSON.stringify({ index: currentIndex, count }));
  }, [progressKey, currentIndex, count]);

  const current = dhikrList[currentIndex] || dhikrList[0];
  const safeCount = Math.max(1, current?.count || 1);
  const isComplete = count >= safeCount;
  const totalProgress = dhikrList.length > 0 ? ((currentIndex + (count / safeCount)) / dhikrList.length) * 100 : 0;
  const categoryInfo = CATEGORY_LABELS[category];
  const stage = totalProgress >= 100 ? "🌳 اكتملت" : totalProgress >= 55 ? "🌿 تتقدم" : "🌱 بداية طيبة";

  const handleTap = () => {
    if (!current || isComplete) return;
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
        }
      }, 700);
    } else {
      setFeedback("success");
      setTimeout(() => setFeedback("idle"), 180);
    }
  };

  const saveForLater = () => {
    setFeedback("complete");
    setTimeout(() => setFeedback("idle"), 700);
  };

  const resetProgress = () => {
    localStorage.removeItem(progressKey);
    setCurrentIndex(0);
    setCount(0);
    setFeedback("idle");
  };

  if (!loaded || !current) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="w-full rounded-card bg-white p-6 text-center text-secondary-text shadow-xl"
      >
        جاري تجهيز الأذكار...
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="w-full overflow-hidden rounded-card bg-white p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
    >
      <div className="relative mb-5 overflow-hidden rounded-[28px] bg-action p-5 text-white">
        <div className="relative z-10">
          <p className="text-sm text-white/75">{categoryInfo.subtitle}</p>
          <h2 className="mt-1 text-2xl font-bold">{categoryInfo.emoji} {categoryInfo.title}</h2>
          <p className="mt-2 text-sm text-white/80">{stage} · {Math.round(totalProgress)}٪ مكتمل</p>
        </div>
        <div className="absolute -bottom-10 left-0 h-20 w-2/3 rounded-tr-[90px] bg-white/20" />
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10" />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 rounded-full bg-primary-bg p-1">
        <button
          onClick={() => setMode("brief")}
          className={`rounded-full py-2 text-sm font-semibold transition ${mode === "brief" ? "bg-white text-action shadow" : "text-secondary-text"}`}
        >
          ⚡ مختصر
        </button>
        <button
          onClick={() => setMode("full")}
          className={`rounded-full py-2 text-sm font-semibold transition ${mode === "full" ? "bg-white text-action shadow" : "text-secondary-text"}`}
        >
          🌿 كامل
        </button>
      </div>

      <div className="mb-4 flex items-center justify-between text-sm text-secondary-text">
        <span>{currentIndex + 1} من {dhikrList.length}</span>
        <span>{current.title}</span>
      </div>

      <div className="mb-5 h-3 w-full overflow-hidden rounded-full bg-primary-bg">
        <div className="h-full rounded-full bg-action transition-all duration-300" style={{ width: `${Math.min(100, totalProgress)}%` }} />
      </div>

      <p className="break-words text-xl font-semibold leading-loose text-primary-text">{current.text}</p>
      <p className="mt-3 text-sm text-secondary-text">التكرار: {safeCount}</p>

      <div className="mt-4 rounded-[26px] bg-primary-bg p-4 text-center">
        <p className="text-3xl font-bold text-action">{count} / {safeCount}</p>
        <p className="mt-1 text-xs text-secondary-text">تقدم هذا الذكر محفوظ تلقائياً</p>
      </div>

      <button
        onClick={handleTap}
        disabled={isComplete}
        className={`mt-4 w-full rounded-full py-4 text-lg font-bold text-white shadow-md transition-all duration-200 ${
          isComplete
            ? "bg-secondary-text cursor-not-allowed"
            : feedback === "complete"
            ? "bg-highlight scale-105"
            : feedback === "success"
            ? "bg-action scale-95"
            : "bg-action hover:opacity-90"
        }`}
      >
        {isComplete ? "تم هذا الذكر" : feedback === "complete" ? "أحسنت" : feedback === "success" ? "جميل" : "اضغط للتسبيح"}
      </button>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button onClick={saveForLater} className="rounded-full bg-primary-bg py-3 text-sm font-semibold text-action">
          حفظ التقدم
        </button>
        <button onClick={resetProgress} className="rounded-full bg-primary-bg py-3 text-sm font-semibold text-secondary-text">
          البدء من جديد
        </button>
      </div>

      {currentIndex + 1 >= dhikrList.length && isComplete && (
        <div className="mt-4 rounded-[28px] bg-mint-soft p-5 text-center">
          <p className="text-2xl">🌳</p>
          <p className="mt-2 font-bold text-primary-text">أحسنت، أتممت أذكارك</p>
          <p className="mt-1 text-sm text-secondary-text">أثر طيب يُكتب لك بإذن الله</p>
        </div>
      )}
    </motion.div>
  );
}
