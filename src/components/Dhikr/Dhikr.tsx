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
        className="bg-white rounded-card shadow-xl p-4 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 text-center text-secondary-text"
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
      className="bg-white rounded-card shadow-xl p-4 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
    >
      <h2 className="text-lg font-semibold text-primary-text mb-2">الأذكار اليومية</h2>
      <p className="text-sm text-secondary-text mb-4">{currentIndex + 1} / {dhikrList.length}</p>

      <p className="text-xl font-semibold text-primary-text leading-relaxed">{current.text}</p>
      <p className="text-sm text-secondary-text mt-2">التكرار: {current.count}</p>

      <div className="w-full bg-primary-bg rounded-full h-2 mt-3">
        <div className="bg-action h-2 rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
      </div>

      <p className="text-2xl font-bold text-action text-center mt-4">{count} / {current.count}</p>

      <button
        onClick={handleTap}
        disabled={isComplete}
        className={`mt-4 w-full py-3 rounded-full text-white font-semibold shadow-md transition-all duration-200 ${
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
          ? "✅ تم"
          : feedback === "complete"
          ? "🎉 أتممت!"
          : feedback === "success"
          ? "👍"
          : "اضغط للتسبيح"}
      </button>

      {isComplete && currentIndex + 1 >= dhikrList.length && (
        <p className="text-center text-sm text-highlight mt-3 font-semibold">✨ أتممت أذكارك اليومية</p>
      )}
    </motion.div>
  );
}
