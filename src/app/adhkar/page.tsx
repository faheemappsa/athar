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

  useEffect(() => {
    const today = new Date().toDateString();
    const savedProgress = localStorage.getItem(`adhkar-progress-${today}`);
    if (savedProgress) setProgress(JSON.parse(savedProgress));
    const savedCompleted = localStorage.getItem(`adhkar-completed-${today}`);
    if (savedCompleted) setCompleted(new Set(JSON.parse(savedCompleted)));
  }, []);

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
      showMessage("✅ لقد أكملت هذا الذكر اليوم!", "error");
      return;
    }
    const current = progress[dhikr.id] || 0;
    if (current + 1 > dhikr.countNumber) return;
    const newProgress = { ...progress, [dhikr.id]: current + 1 };
    setProgress(newProgress);
    
    if (current + 1 === dhikr.countNumber) {
      const newCompleted = new Set(completed);
      newCompleted.add(dhikr.id);
      setCompleted(newCompleted);
      saveProgress(newProgress, newCompleted);
      showMessage(`✨ أتممت "${dhikr.text.slice(0, 40)}..." +1 نقطة`, "success");
      // تحديث شجرة الأثر
      const treeCount = localStorage.getItem("athar-tree-completed");
      const newTreeCount = treeCount ? parseInt(treeCount) + 1 : 1;
      localStorage.setItem("athar-tree-completed", newTreeCount.toString());
      window.dispatchEvent(new Event("athar-tree-update"));
    } else {
      saveProgress(newProgress, completed);
      showMessage(`📖 تقدم: ${current + 1}/${dhikr.countNumber}`, "success");
    }
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
    showMessage(`🔁 تراجعت إلى ${current - 1}/${dhikr.countNumber}`, "success");
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
    <main className="min-h-screen pb-28 bg-gradient-to-b from-athar-bg to-white dark:from-gray-900 dark:to-gray-800">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-4 border-b border-athar-bg-200">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-athar-accent-500" />
          <h1 className="text-2xl font-bold text-athar-primary">الأذكار</h1>
        </div>
      </header>

      <section className="px-4 py-2 flex gap-2 overflow-x-auto sticky top-[73px] z-10 bg-inherit backdrop-blur-sm pb-2">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all active:scale-95 ${
              activeCategory === cat.key
                ? "bg-athar-accent-500 text-white shadow-md"
                : "bg-white dark:bg-gray-800 text-athar-text border border-athar-bg-200"
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
              <div key={dhikr.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-athar-bg-200 dark:border-gray-700 space-y-3 transition-all hover:shadow-md">
                <p className="text-lg font-medium text-athar-text leading-relaxed">{dhikr.text}</p>
                <div className="flex justify-between items-center text-xs text-athar-muted">
                  <span>📖 {dhikr.reference}</span>
                  <span>🔄 {dhikr.countText}</span>
                </div>
                {dhikr.virtue && <p className="text-xs italic text-athar-accent-600 border-r-2 border-athar-accent-300 pr-2">✨ {dhikr.virtue}</p>}
                
                {!isCompleted ? (
                  <>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-athar-accent-500 transition-all duration-300 rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                    <div className="flex items-center justify-center gap-6 mt-2">
                      <button onClick={() => decrement(dhikr)} className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center active:scale-95 transition-all hover:bg-gray-200"><Minus className="w-5 h-5 text-athar-text" /></button>
                      <span className="text-2xl font-bold text-athar-accent-500">{current}/{dhikr.countNumber}</span>
                      <button onClick={() => increment(dhikr)} className="w-12 h-12 rounded-full bg-athar-accent-500 text-white flex items-center justify-center active:scale-95 transition-all shadow-md hover:bg-athar-accent-600"><Plus className="w-5 h-5" /></button>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-center items-center gap-2 py-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">تم الإكمال اليوم</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>

      {message && (
        <div className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 px-5 py-2.5 rounded-full text-sm font-medium shadow-lg animate-fade-up ${
          message.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
        }`}>
          {message.text}
        </div>
      )}
      <BottomNav />
    </main>
  );
}
