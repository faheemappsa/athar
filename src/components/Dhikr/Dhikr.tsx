import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ADHKAR, CATEGORY_LABELS, type DhikrCategory, type DhikrMode } from "../../data/adhkar";
import { useSavedLocation } from "../../hooks/useSavedLocation";
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

const PERIOD_LABEL: Record<DhikrCategory, string> = {
  morning: "وقت الصباح",
  evening: "وقت المساء",
  sleep: "وقت السكينة",
};

const CONTINUITY_KEY = "athar-dhikr-completion-days";

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const readCompletionDays = () => {
  try {
    return JSON.parse(localStorage.getItem(CONTINUITY_KEY) || "[]") as string[];
  } catch {
    return [];
  }
};

const saveCompletionDay = () => {
  try {
    const today = getTodayKey();
    const days = readCompletionDays();
    const next = [today, ...days.filter((day) => day !== today)].slice(0, 30);
    localStorage.setItem(CONTINUITY_KEY, JSON.stringify(next));
    return next;
  } catch {
    return [];
  }
};

export default function Dhikr() {
  const { location } = useSavedLocation();
  const [category, setCategory] = useState<DhikrCategory>(getFallbackCategory);
  const mode: DhikrMode = "full";
  const [currentIndex, setCurrentIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [feedback, setFeedback] = useState<"idle" | "success" | "complete">("idle");
  const [loaded, setLoaded] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);
  const [completionDays, setCompletionDays] = useState<string[]>([]);

  useEffect(() => {
    setCompletionDays(readCompletionDays());
  }, []);

  useEffect(() => {
    let mounted = true;

    const resolveCategory = async () => {
      setLoaded(false);
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

  const dhikrList = useMemo(() => ADHKAR[category] || ADHKAR.morning, [category]);

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
    try {
      localStorage.setItem(progressKey, JSON.stringify({ index: currentIndex, count }));
    } catch {}
  }, [progressKey, currentIndex, count]);

  const current = dhikrList[currentIndex] || dhikrList[0];
  const safeCount = Math.max(1, current?.count || 1);
  const isComplete = count >= safeCount;
  const isFinalDhikr = currentIndex + 1 >= dhikrList.length;
  const itemProgress = Math.min(100, (count / safeCount) * 100);
  const remainingCount = Math.max(0, safeCount - count);
  const totalProgress = dhikrList.length > 0 ? ((currentIndex + count / safeCount) / dhikrList.length) * 100 : 0;
  const categoryInfo = CATEGORY_LABELS[category];
  const completionCount = completionDays.length;
  const identityCopy = completionCount >= 7 ? "أسبوع من المواظبة" : completionCount >= 3 ? `${completionCount} أيام من الوصل` : "عدت اليوم إلى الذكر";

  const recordSessionCompletion = () => {
    const next = saveCompletionDay();
    setCompletionDays(next);
  };

  const goToNextDhikr = () => {
    if (currentIndex + 1 < dhikrList.length) {
      setCurrentIndex(currentIndex + 1);
      setCount(0);
      setFeedback("idle");
      setPulseKey((value) => value + 1);
      return;
    }

    setCount(safeCount);
    setFeedback("complete");
    recordSessionCompletion();
  };

  const handleTap = () => {
    if (!current || isComplete) return;
    try {
      navigator.vibrate?.(8);
    } catch {}

    const newCount = Math.min(count + 1, safeCount);
    setCount(newCount);
    setPulseKey((value) => value + 1);

    if (newCount === safeCount) {
      setFeedback("complete");
      if (isFinalDhikr) recordSessionCompletion();
      setTimeout(() => {
        if (currentIndex + 1 < dhikrList.length) {
          setCurrentIndex(currentIndex + 1);
          setCount(0);
          setFeedback("idle");
        }
      }, 900);
    } else {
      setFeedback("success");
      setTimeout(() => setFeedback("idle"), 180);
    }
  };

  const resetProgress = () => {
    localStorage.removeItem(progressKey);
    setCurrentIndex(0);
    setCount(0);
    setFeedback("idle");
    setPulseKey((value) => value + 1);
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
      <div className="mb-4 flex items-center justify-between rounded-full bg-primary-bg px-4 py-3 text-sm font-bold text-secondary-text">
        <span className="text-action">{categoryInfo.emoji} {categoryInfo.title}</span>
        <span>{PERIOD_LABEL[category]}</span>
      </div>

      <div className="mb-4 h-3 w-full overflow-hidden rounded-full bg-primary-bg">
        <div className="h-full rounded-full bg-action transition-all duration-300" style={{ width: `${Math.min(100, totalProgress)}%` }} />
      </div>

      <div className="mb-4 flex items-center justify-between text-sm text-secondary-text">
        <span>{currentIndex + 1} من {dhikrList.length}</span>
        <span>{current.title}</span>
      </div>

      <p className="break-words text-xl font-semibold leading-loose text-primary-text">{current.text}</p>
      <div className="mt-3 flex items-center justify-between text-sm text-secondary-text">
        <span>التكرار: {safeCount}</span>
        <span className="font-bold text-action">المتبقي: {remainingCount}</span>
      </div>

      <button
        onClick={handleTap}
        disabled={isComplete}
        className="group mt-6 block w-full outline-none disabled:cursor-default"
        aria-label="اضغط للتسبيح"
      >
        <motion.div
          key={`ring-${pulseKey}`}
          animate={feedback === "success" ? { scale: [1, 0.975, 1.012, 1] } : feedback === "complete" ? { scale: [1, 1.035, 1] } : { scale: 1 }}
          transition={{ duration: feedback === "complete" ? 0.55 : 0.22, ease: "easeOut" }}
          className="relative mx-auto grid h-60 w-60 place-items-center rounded-full"
        >
          <div
            className="absolute inset-0 rounded-full transition-all duration-300"
            style={{
              background: `conic-gradient(#38A47C ${itemProgress}%, rgba(56,164,124,0.12) ${itemProgress}%)`,
            }}
          />
          <div className="absolute inset-[10px] rounded-full bg-white shadow-xl shadow-action/10" />
          <div className="absolute inset-[22px] rounded-full bg-primary-bg/80" />

          <motion.div
            key={`pulse-${pulseKey}`}
            initial={{ opacity: 0.42, scale: 0.78 }}
            animate={{ opacity: 0, scale: 1.28 }}
            transition={{ duration: 0.42, ease: "easeOut" }}
            className="absolute inset-2 rounded-full border border-action/30"
          />

          {feedback === "complete" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.75 }}
              animate={{ opacity: [0, 0.55, 0], scale: [0.75, 1.2, 1.42] }}
              transition={{ duration: 0.85, ease: "easeOut" }}
              className="absolute inset-0 rounded-full bg-action/20 blur-md"
            />
          )}

          <div className="relative z-10 text-center">
            <p className="text-5xl font-extrabold leading-none text-action">{count}</p>
            <p className="mt-2 text-sm font-bold text-secondary-text">من {safeCount}</p>
            <p className="mt-4 text-sm font-semibold text-primary-text">
              {feedback === "complete" ? "تم الذكر" : feedback === "success" ? "" : "اضغط للتسبيح"}
            </p>
          </div>
        </motion.div>
      </button>

      {!isComplete && (
        <button onClick={goToNextDhikr} className="mx-auto mt-3 block rounded-full px-5 py-2 text-sm font-bold text-secondary-text transition hover:bg-primary-bg">
          الذكر التالي ←
        </button>
      )}

      <p className="mt-3 text-center text-xs text-secondary-text">تقدمك محفوظ تلقائياً</p>

      <div className="mt-4 flex justify-center">
        <button onClick={resetProgress} className="rounded-full bg-primary-bg px-6 py-3 text-sm font-semibold text-secondary-text">
          إعادة الأذكار
        </button>
      </div>

      {isFinalDhikr && isComplete && (
        <div className="mt-4 overflow-hidden rounded-[28px] bg-mint-soft p-5 text-center">
          <p className="text-2xl">🌿</p>
          <p className="mt-2 text-lg font-extrabold text-primary-text">من أهل الذكر</p>
          <p className="mt-1 text-sm font-semibold text-secondary-text">{identityCopy}</p>
          <p className="mt-3 text-sm leading-relaxed text-secondary-text">غدًا نلتقي على ذكرٍ جديد.</p>
        </div>
      )}
    </motion.div>
  );
}
