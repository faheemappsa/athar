import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { appMotion } from "../../config/motion";
import { ADHKAR, CATEGORY_LABELS, type DhikrCategory, type DhikrMode } from "../../data/adhkar";
import { MORNING_EXTRA_ADHKAR } from "../../data/adhkarMorningExtra";
import { SLEEP_ADHKAR_EXTRA } from "../../data/sleepAdhkarExtra";
import { useSavedLocation } from "../../hooks/useSavedLocation";
import { getPrayerTimes } from "../../services/prayerApi";
import { getDhikrCompletionIdentity } from "../../utils/dhikrCompletion";
import DhikrCompletionCard from "./DhikrCompletionCard";
import DhikrSessionHeader from "./DhikrSessionHeader";

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

const broadcastDhikrFocus = (active: boolean) => {
  window.dispatchEvent(new CustomEvent("athar-focus-mode", { detail: { path: "/dhikr", active } }));
};

const getDhikrList = (category: DhikrCategory) => {
  const baseList = ADHKAR[category] || ADHKAR.morning;

  if (category === "morning") {
    const existingIds = new Set(baseList.map((item) => item.id));
    const additions = MORNING_EXTRA_ADHKAR.filter((item) => !existingIds.has(item.id));
    return [...baseList, ...additions];
  }

  if (category === "sleep") {
    const existingIds = new Set(baseList.map((item) => item.id));
    const additions = SLEEP_ADHKAR_EXTRA.filter((item) => !existingIds.has(item.id));
    return [...baseList, ...additions];
  }

  return baseList;
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
  const [focusMode, setFocusMode] = useState(false);
  const surfaceMotion = appMotion.surface;
  const counterMotion = appMotion.dhikrCounter;
  const pulseMotion = appMotion.dhikrPulse;
  const glowMotion = appMotion.dhikrCompleteGlow;

  const enterFocusMode = () => {
    setFocusMode(true);
    broadcastDhikrFocus(true);
  };

  const exitFocusMode = () => {
    setFocusMode(false);
    broadcastDhikrFocus(false);
  };

  useEffect(() => {
    setCompletionDays(readCompletionDays());
  }, []);

  useEffect(() => {
    const scrollElement = document.getElementById("app-scroll");
    if (!scrollElement) return;

    const handleScroll = () => {
      if (scrollElement.scrollTop > 28) enterFocusMode();
      if (scrollElement.scrollTop < 10) exitFocusMode();
    };

    scrollElement.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      broadcastDhikrFocus(false);
      scrollElement.removeEventListener("scroll", handleScroll);
    };
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

  const dhikrList = useMemo(() => getDhikrList(category), [category]);

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
  const identityCopy = getDhikrCompletionIdentity(completionCount);

  const recordSessionCompletion = () => {
    const next = saveCompletionDay();
    setCompletionDays(next);
  };

  const goToNextDhikr = () => {
    enterFocusMode();
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
    enterFocusMode();
    if (!current || isComplete) return;

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
    exitFocusMode();
    localStorage.removeItem(progressKey);
    setCurrentIndex(0);
    setCount(0);
    setFeedback("idle");
    setPulseKey((value) => value + 1);
  };

  if (!loaded || !current) {
    return (
      <motion.div
        initial={surfaceMotion.initial}
        animate={surfaceMotion.animate}
        transition={surfaceMotion.transition}
        className="w-full rounded-card bg-white p-6 text-center text-secondary-text shadow-xl"
      >
        جاري تجهيز الأذكار...
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={surfaceMotion.initial}
      animate={surfaceMotion.animate}
      transition={surfaceMotion.transition}
      className={`w-full overflow-hidden rounded-card bg-white shadow-xl transition-all duration-300 hover:shadow-2xl ${focusMode ? "flex min-h-[calc(100dvh-10rem)] flex-col p-4" : "p-5"}`}
    >
      <div className={focusMode ? "flex min-h-[calc(100dvh-12rem)] flex-col" : ""}>
        <div className="shrink-0">
          <DhikrSessionHeader
            emoji={categoryInfo.emoji}
            title={categoryInfo.title}
            category={category}
            currentIndex={currentIndex}
            totalCount={dhikrList.length}
            progress={totalProgress}
          />
        </div>

        <div className={focusMode ? "mt-4 flex flex-1 flex-col justify-center" : "mt-4"}>
          <div className="flex items-center justify-between text-sm text-secondary-text">
            <span>{current.title}</span>
            <span className="font-bold text-action">المتبقي: {remainingCount}</span>
          </div>

          <p className={`mt-4 break-words font-semibold leading-loose text-primary-text ${focusMode ? "max-h-[27dvh] overflow-y-auto text-center text-[1.35rem]" : "text-xl"}`}>{current.text}</p>

          <div className="mt-3 flex items-center justify-between text-sm text-secondary-text">
            <span>التكرار: {safeCount}</span>
            <span>{count} من {safeCount}</span>
          </div>

          <button
            onClick={handleTap}
            disabled={isComplete}
            className={`group mx-auto block w-fit outline-none transition-all duration-300 disabled:cursor-default ${focusMode ? "mt-7" : "mt-6"}`}
            aria-label="اضغط للتسبيح"
          >
            <motion.div
              key={`ring-${pulseKey}`}
              animate={feedback === "success" ? counterMotion.success : feedback === "complete" ? counterMotion.complete : counterMotion.idle}
              transition={feedback === "complete" ? counterMotion.completeTransition : counterMotion.successTransition}
              className={`relative mx-auto grid place-items-center rounded-full transition-all duration-300 ${focusMode ? "h-[clamp(14rem,38dvh,17rem)] w-[clamp(14rem,38dvh,17rem)]" : "h-60 w-60"}`}
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
                initial={pulseMotion.initial}
                animate={pulseMotion.animate}
                transition={pulseMotion.transition}
                className="absolute inset-2 rounded-full border border-action/30"
              />

              {feedback === "complete" && (
                <motion.div
                  initial={glowMotion.initial}
                  animate={glowMotion.animate}
                  transition={glowMotion.transition}
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
        </div>

        <div className={focusMode ? "shrink-0 pt-3" : ""}>
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
            <DhikrCompletionCard category={category} identityCopy={identityCopy} completionCount={completionCount} />
          )}
        </div>
      </div>
    </motion.div>
  );
}
