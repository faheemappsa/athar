"use client";

import { useState, useEffect } from "react";
import { Loader2, AlertCircle, RefreshCw, BookOpen, Sun, Moon, BedDouble, Plus, Minus, CheckCircle } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { adhkarLibrary, getAdhkarByCategory, getAdhkarByTimeOfDay, type DhikrItem } from "@/lib/adhkar-data";

export default function AdhkarPage() {
  // التصنيف النشط: يمكن أن يكون "صباح", "مساء", "نوم"
  const [activeCategory, setActiveCategory] = useState<"صباح" | "مساء" | "نوم">("صباح");
  const [adhkar, setAdhkar] = useState<DhikrItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [completedToday, setCompletedToday] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState<Record<string, number>>({}); // { id: currentCount }
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // تحميل التقدم اليومي وحالة الإكمال من localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    const savedCompleted = localStorage.getItem(`athar-adhkar-${today}`);
    if (savedCompleted) {
      setCompletedToday(new Set(JSON.parse(savedCompleted)));
    }
    const savedProgress = localStorage.getItem(`athar-adhkar-progress-${today}`);
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    } else {
      setProgress({});
    }
  }, []);

  // تحديث التصنيف بناءً على الوقت الفعلي (مرة واحدة عند التحميل)
  useEffect(() => {
    const hour = new Date().getHours();
    const suggested = getAdhkarByTimeOfDay(hour);
    setActiveCategory(suggested);
  }, []);

  const loadAdhkarForCategory = (category: "صباح" | "مساء" | "نوم") => {
    setLoading(true);
    setError(false);
    try {
      const items = getAdhkarByCategory(category);
      setAdhkar(items);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdhkarForCategory(activeCategory);
  }, [activeCategory]);

  // حفظ التقدم اليومي
  const saveProgress = (newProgress: Record<string, number>, newCompleted: Set<string>) => {
    const today = new Date().toDateString();
    localStorage.setItem(`athar-adhkar-progress-${today}`, JSON.stringify(newProgress));
    localStorage.setItem(`athar-adhkar-${today}`, JSON.stringify(Array.from(newCompleted)));
  };

  // زيادة العداد لذكر معين (تسبيحة)
  const incrementCount = (dhikr: DhikrItem) => {
    if (completedToday.has(dhikr.id)) {
      showMessage("لقد أكملت هذا الذكر اليوم بالفعل", "error");
      return;
    }
    const target = dhikr.countNumber || 1;
    const current = progress[dhikr.id] || 0;
    const newCount = Math.min(current + 1, target);
    const newProgress = { ...progress, [dhikr.id]: newCount };
    setProgress(newProgress);

    let newCompleted = new Set(completedToday);
    let addToTree = false;

    if (newCount >= target) {
      // تم إكمال الذكر
      newCompleted.add(dhikr.id);
      setCompletedToday(newCompleted);
      addToTree = true;
      showMessage(`✨ تم إكمال ${dhikr.text.substring(0, 30)}...`, "success");
    }

    saveProgress(newProgress, newCompleted);

    if (addToTree) {
      // تحديث شجرة الأثر
      const currentTree = localStorage.getItem("athar-tree-completed");
      const newTreeCount = currentTree ? parseInt(currentTree) + 1 : 1;
      localStorage.setItem("athar-tree-completed", newTreeCount.toString());
      window.dispatchEvent(new Event("athar-tree-update"));
    }
  };

  // إنقاص العداد (للتراجع)
  const decrementCount = (dhikr: DhikrItem) => {
    if (completedToday.has(dhikr.id)) {
      showMessage("لا يمكن التراجع عن ذكر مكتمل", "error");
      return;
    }
    const current = progress[dhikr.id] || 0;
    if (current === 0) return;
    const newCount = current - 1;
    const newProgress = { ...progress, [dhikr.id]: newCount };
    setProgress(newProgress);
    saveProgress(newProgress, completedToday);
  };

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 2500);
  };

  const categories = [
    { key: "صباح" as const, label: "أذكار الصباح", icon: Sun, timeRange: "3ص - 12م" },
    { key: "مساء" as const, label: "أذكار المساء", icon: Moon, timeRange: "12م - 7م" },
    { key: "نوم" as const, label: "أذكار النوم", icon: BedDouble, timeRange: "7م - 3ص" },
  ];

  return (
    <main className="min-h-screen pb-28 bg-athar-bg">
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-athar-primary" />
          <h1 className="text-2xl font-bold text-athar-primary">الأذكار</h1>
        </div>
        <button
          onClick={() => loadAdhkarForCategory(activeCategory)}
          className="p-2 rounded-full bg-white/80 shadow-sm active:scale-95 transition-all"
        >
          <RefreshCw className="w-5 h-5 text-athar-primary" />
        </button>
      </header>

      {/* علامات التبويب مع إشارة الوقت المناسب */}
      <section className="px-4 py-2 flex gap-2 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 touch-manipulation whitespace-nowrap ${
              activeCategory === cat.key
                ? "bg-athar-accent-500 text-white shadow-md"
                : "bg-white text-athar-text hover:bg-athar-primary/10"
            }`}
          >
            <cat.icon className="w-4 h-4" />
            {cat.label}
            <span className="text-[0.6rem] opacity-70 hidden sm:inline">{cat.timeRange}</span>
          </button>
        ))}
      </section>

      {/* قائمة الأذكار مع التسبيحات التفاعلية */}
      <section className="px-4 py-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-athar-accent-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center gap-2 py-12 text-red-500">
            <AlertCircle className="w-5 h-5" />
            <span>تعذر جلب الأذكار</span>
          </div>
        ) : (
          adhkar.map((dhikr) => {
            const isCompleted = completedToday.has(dhikr.id);
            const target = dhikr.countNumber || 1;
            const current = progress[dhikr.id] || 0;
            const isProgressBased = !!dhikr.countNumber;
            const displayCount = isProgressBased ? `${current}/${target}` : dhikr.count;
            const completionPercent = (current / target) * 100;

            return (
              <div
                key={dhikr.id}
                className={`athar-card space-y-2 transition-all ${isCompleted ? "opacity-70" : ""}`}
              >
                {/* نص الذكر */}
                <p className="text-base font-medium text-athar-text leading-relaxed">
                  {dhikr.text}
                </p>

                {/* شريط التقدم (للأذكار ذات العدد) */}
                {isProgressBased && !isCompleted && (
                  <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-athar-accent-500 transition-all duration-300"
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>
                )}

                {/* العداد وأزرار التسبيح (للأذكار ذات العدد) */}
                {isProgressBased && !isCompleted && (
                  <div className="flex items-center gap-4 mt-2">
                    <button
                      onClick={() => decrementCount(dhikr)}
                      className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center active:scale-95 touch-manipulation"
                    >
                      <Minus className="w-5 h-5 text-athar-text" />
                    </button>
                    <div className="flex-1 text-center">
                      <span className="text-2xl font-bold text-athar-accent-500">{displayCount}</span>
                    </div>
                    <button
                      onClick={() => incrementCount(dhikr)}
                      className="w-10 h-10 rounded-full bg-athar-accent-500 text-white flex items-center justify-center active:scale-95 touch-manipulation shadow-md"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* عرض العدد النصي (للأذكار العادية) */}
                {!isProgressBased && dhikr.count && (
                  <span className="inline-block text-xs bg-athar-primary/10 text-athar-primary px-2 py-0.5 rounded-full">
                    {dhikr.count}
                  </span>
                )}

                {/* فضل الذكر */}
                {dhikr.virtue && (
                  <p className="text-xs text-athar-muted italic border-r-2 border-athar-accent pr-2 mr-1">
                    {dhikr.virtue}
                  </p>
                )}

                {/* المصدر */}
                <p className="text-xs text-athar-muted">— {dhikr.reference}</p>

                {/* علامة الإكمال */}
                {isCompleted && (
                  <div className="flex justify-end mt-1">
                    <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> تم اليوم
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>

      {/* Toast الرسائل */}
      {message && (
        <div
          className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-full text-sm shadow-lg animate-fade-up ${
            message.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {message.text}
        </div>
      )}

      <BottomNav />
    </main>
  );
}
