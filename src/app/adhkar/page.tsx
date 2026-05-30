"use client";

import { useState, useEffect } from "react";
import { Loader2, BookOpen, Sun, Moon, BedDouble, Plus, Minus, CheckCircle } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { adhkarLibrary, getAdhkarByCategory, getAdhkarByTimeOfDay, type DhikrItem } from "@/lib/adhkar-data";

export default function AdhkarPage() {
  const [activeCategory, setActiveCategory] = useState<"صباح" | "مساء" | "نوم">("صباح");
  const [adhkar, setAdhkar] = useState<DhikrItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // تحميل التقدم والإكمال لليوم الحالي
  useEffect(() => {
    const today = new Date().toDateString();
    const savedProgress = localStorage.getItem(`adhkar-progress-${today}`);
    if (savedProgress) setProgress(JSON.parse(savedProgress));
    const savedCompleted = localStorage.getItem(`adhkar-completed-${today}`);
    if (savedCompleted) setCompleted(new Set(JSON.parse(savedCompleted)));
  }, []);

  // ضبط التصنيف حسب الوقت
  useEffect(() => {
    const hour = new Date().getHours();
    setActiveCategory(getAdhkarByTimeOfDay(hour));
  }, []);

  useEffect(() => {
    setLoading(true);
    const items = getAdhkarByCategory(activeCategory);
    setAdhkar(items);
    setLoading(false);
  }, [activeCategory]);

  const saveProgress = (newProgress: Record<string, number>, newCompleted: Set<string>) => {
    const today = new Date().toDateString();
    localStorage.setItem(`adhkar-progress-${today}`, JSON.stringify(newProgress));
    localStorage.setItem(`adhkar-completed-${today}`, JSON.stringify(Array.from(newCompleted)));
  };

  const increment = (dhikr: DhikrItem) => {
    if (completed.has(dhikr.id)) {
      showMessage("لقد أكملت هذا الذكر اليوم!", "error");
      return;
    }
    const current = progress[dhikr.id] || 0;
    if (current + 1 > dhikr.countNumber) return;
    const newProgress = { ...progress, [dhikr.id]: current + 1 };
    setProgress(newProgress);
    
    let newCompleted = new Set(completed);
    let treeUpdated = false;
    if (current + 1 === dhikr.countNumber) {
      newCompleted.add(dhikr.id);
      setCompleted(newCompleted);
      treeUpdated = true;
      showMessage(`✨ أتممت ${dhikr.text.substring(0, 30)}... +1 نقطة للشجرة`, "success");
      // تحديث شجرة الأثر
      const treeCount = localStorage.getItem("athar-tree-completed");
      const newTreeCount = treeCount ? parseInt(treeCount) + 1 : 1;
      localStorage.setItem("athar-tree-completed", newTreeCount.toString());
      window.dispatchEvent(new Event("athar-tree-update"));
    }
    saveProgress(newProgress, newCompleted);
    if (!treeUpdated) showMessage(`تقدم: ${current + 1}/${dhikr.countNumber}`, "success");
  };

  const decrement = (dhikr: DhikrItem) => {
    if (completed.has(dhikr.id)) {
      showMessage("لا يمكن التراجع عن ذكر مكتمل", "error");
      return;
    }
    const current = progress[dhikr.id] || 0;
    if (current === 0) return;
    const newProgress = { ...progress, [dhikr.id]: current - 1 };
    setProgress(newProgress);
    saveProgress(newProgress, completed);
    showMessage(`تراجعت إلى ${current - 1}/${dhikr.countNumber}`, "success");
  };

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 2000);
  };

  const categories = [
    { key: "صباح" as const, label: "أذكار الصباح", icon: Sun },
    { key: "مساء" as const, label: "أذكار المساء", icon: Moon },
    { key: "نوم" as const, label: "أذكار النوم", icon: BedDouble },
  ];

  return (
    <main className="min-h-screen pb-28 bg-athar-bg">
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-athar-primary" />
          <h1 className="text-2xl font-bold text-athar-primary">الأذكار</h1>
        </div>
      </header>

      <section className="px-4 py-2 flex gap-2 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 ${
              activeCategory === cat.key
                ? "bg-athar-accent-500 text-white shadow-md"
                : "bg-white text-athar-text hover:bg-athar-primary/10"
            }`}
          >
            <cat.icon className="w-4 h-4" />
            {cat.label}
          </button>
        ))}
      </section>

      <section className="px-4 py-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-athar-accent-500 animate-spin" /></div>
        ) : (
          adhkar.map((dhikr) => {
            const isCompleted = completed.has(dhikr.id);
            const current = progress[dhikr.id] || 0;
            const percent = (current / dhikr.countNumber) * 100;
            return (
              <div key={dhikr.id} className={`bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-athar-bg-200 dark:border-gray-700 space-y-2 transition-all ${isCompleted ? "opacity-60" : ""}`}>
                <p className="text-base font-medium text-athar-text leading-relaxed">{dhikr.text}</p>
                <p className="text-xs text-athar-muted">— {dhikr.reference}</p>
                {dhikr.virtue && <p className="text-xs italic text-athar-primary">{dhikr.virtue}</p>}
                
                {!isCompleted && (
                  <>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-athar-accent-500 transition-all" style={{ width: `${percent}%` }} /></div>
                    <div className="flex items-center justify-between gap-4 mt-2">
                      <button onClick={() => decrement(dhikr)} className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center active:scale-95"><Minus className="w-5 h-5" /></button>
                      <span className="text-2xl font-bold text-athar-accent-500">{current}/{dhikr.countNumber}</span>
                      <button onClick={() => increment(dhikr)} className="w-12 h-12 rounded-full bg-athar-accent-500 text-white flex items-center justify-center active:scale-95 shadow-md"><Plus className="w-5 h-5" /></button>
                    </div>
                  </>
                )}
                {isCompleted && <div className="flex justify-end"><CheckCircle className="w-5 h-5 text-green-600" /></div>}
              </div>
            );
          })
        )}
      </section>

      {message && <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 bg-black/80 text-white px-4 py-2 rounded-full text-sm">{message.text}</div>}
      <BottomNav />
    </main>
  );
}
