import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getMorningDhikr, getEveningDhikr, getSleepDhikr } from "../../services/dhikrApi";

type DhikrItem = { text: string; count: number; source?: string };

export default function Dhikr() {
  const [dhikrList, setDhikrList] = useState<DhikrItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [feedback, setFeedback] = useState<"idle" | "success" | "complete">("idle");

  useEffect(() => {
    const hour = new Date().getHours();
    let fetchFn;
    if (hour >= 5 && hour < 12) fetchFn = getMorningDhikr;
    else if (hour >= 17 && hour < 20) fetchFn = getEveningDhikr;
    else if (hour >= 23 || hour < 5) fetchFn = getSleepDhikr;
    else fetchFn = getMorningDhikr;

    fetchFn().then((data) => {
      setDhikrList(data);
      setCurrentIndex(0);
      setCount(0);
      setFeedback("idle");
    });
  }, []);

  if (dhikrList.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="w-full rounded-card bg-white p-5 text-center text-secondary-text shadow-xl"
      >
        جاري التحميل...
      </motion.div>
    );
  }

  const current = dhikrList[currentIndex];
  const isComplete = count >= current.count;

  const handleTap = () => {
    if (isComplete) return;

    if (navigator.vibrate) navigator.vibrate(10);

    const newCount = Math.min(count + 1, current.count);
    setCount(newCount);

    if (newCount === current.count) {
      setFeedback("complete");
      setTimeout(() => {
        if (currentIndex + 1 < dhikrList.length) {
          setCurrentIndex(currentIndex + 1);
          setCount(0);
          setFeedback("idle");
        } else {
          setFeedback("complete");
        }
      }, 1500);
    } else {
      setFeedback("success");
      setTimeout(() => setFeedback("idle"), 300);
    }
  };

  const progressPercent = (count / current.count) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="w-full overflow-hidden rounded-card bg-white p-5 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
    >
      <h2 className="mb-2 text-lg font-bold text-primary-text">الأذكار اليومية</h2>
      <p className="mb-4 text-sm text-secondary-text">{currentIndex + 1} / {dhikrList.length}</p>

      <p className="break-words text-xl font-semibold leading-loose text-primary-text">{current.text}</p>
      <p className="mt-2 text-sm text-secondary-text">التكرار: {current.count}</p>

      <div className="mt-3 h-3 w-full rounded-full bg-primary-bg">
        <div className="h-3 rounded-full bg-action transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
      </div>

      <p className="mt-4 text-center text-2xl font-bold text-action">{count} / {current.count}</p>

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
        {isComplete
          ? "تم"
          : feedback === "complete"
          ? "أتممت"
          : feedback === "success"
          ? "جميل"
          : "اضغط للتسبيح"}
      </button>

      {isComplete && currentIndex + 1 >= dhikrList.length && (
        <p className="mt-3 text-center text-sm font-semibold text-highlight">أتممت أذكارك اليومية</p>
      )}
    </motion.div>
  );
}
