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

export default function Dhikr() {
  const { location } = useSavedLocation();
  const [category, setCategory] = useState<DhikrCategory>(getFallbackCategory);
  const [mode, setMode] = useState<DhikrMode>("full");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [feedback, setFeedback] = useState<"idle" | "success" | "complete">("idle");
  const [loaded, setLoaded] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);

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

  const dhikrList = useMemo(() => {
    const all = ADHKAR[category] || ADHKAR.morning;
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
    try {
      localStorage.setItem(progressKey, JSON.stringify({ index: currentIndex, count }));
    } catch {}
  }, [progressKey, currentIndex, count]);

  const current = dhikrList[currentIndex] || dhikrList[0];
  const safeCount = Math.max(1, current?.count || 1);
  const isComplete = count >= safeCount;
  const itemProgress = Math.min(100, (count / safeCount) * 100);
  const totalProgress = dhikrList.length > 0 ? ((currentIndex + count / safeCount) / dhikrList.length) * 100 : 0;
  const categoryInfo = CATEGORY_LABELS[category];
  const stage = totalProgress >= 100 ? "🌳 اكتملت" : totalProgress >= 55 ? "🌿 تتقدم" : "🌱 بداية طيبة";

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

  const saveForLater = () => {
    setFeedback("complete");
    setTimeout(() => setFeedback("idle"), 700);
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
      <div className="relative mb-5 overflow-hidden rounded-[28px] bg-action p-5 text-white">
        <div className="relative z-10">
          <p className="text-sm text-white/75">{PERIOD_LABEL[category]}</p>
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

      <p className="mt-3 text-center text-xs text-secondary-text">تقدم هذا الذكر محفوظ تلقائياً</p>

      <div className="mt-4 grid grid-cols-2 gap-2">
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
          <p className="mt-2 font-bold text-primary-text">أتممت أذكارك</p>
          <p className="mt-1 text-sm text-secondary-text">أثر طيب يُكتب لك بإذن الله</p>
        </div>
      )}
    </motion.div>
  );
}
