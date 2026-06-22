import { useEffect, useState } from "react";
import { getMorningDhikr, getEveningDhikr, getSleepDhikr } from "../../services/dhikrApi";

type DhikrItem = { text: string; count: number; source?: string };

export default function Dhikr() {
  const [dhikrList, setDhikrList] = useState<DhikrItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const hour = new Date().getHours();
    let fetchFn;
    if (hour >= 5 && hour < 12) fetchFn = getMorningDhikr;
    else if (hour >= 17 && hour < 20) fetchFn = getEveningDhikr;
    else if (hour >= 23 || hour < 5) fetchFn = getSleepDhikr;
    else fetchFn = getMorningDhikr; // fallback

    fetchFn().then((data) => {
      setDhikrList(data);
      setCurrentIndex(0);
      setCount(0);
    });
  }, []);

  if (dhikrList.length === 0) {
    return <div className="bg-card-bg rounded-card p-4 shadow-lg text-center text-secondary-text">جاري التحميل...</div>;
  }

  const current = dhikrList[currentIndex];
  const isComplete = count >= current.count;

  return (
    <div className="bg-card-bg rounded-card p-4 shadow-lg">
      <h2 className="text-lg font-semibold text-primary-text mb-2">الأذكار اليومية</h2>
      <p className="text-sm text-secondary-text mb-4">{currentIndex + 1} / {dhikrList.length}</p>
      <p className="text-xl font-semibold text-primary-text leading-relaxed">{current.text}</p>
      <p className="text-sm text-secondary-text mt-2">التكرار: {current.count}</p>
      <p className="text-2xl font-bold text-action text-center mt-4">{count} / {current.count}</p>
      <button
        onClick={() => setCount((c) => Math.min(c + 1, current.count))}
        disabled={isComplete}
        className={`mt-4 w-full py-3 rounded-full text-white font-semibold shadow-md transition ${
          isComplete ? "bg-gray-400 cursor-not-allowed" : "bg-action hover:opacity-90"
        }`}
      >
        {isComplete ? "✅ تم" : "اضغط للتسبيح"}
      </button>
    </div>
  );
}
