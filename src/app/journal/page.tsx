"use client";

import { useState, useEffect } from "react";
import { CalendarHeart, Loader2, Bookmark, Trash2 } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import type { AtharItem } from "@/lib/api";

interface JournalEntry {
  date: string;
  athar: AtharItem;
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEntries = () => {
    setLoading(true);
    try {
      const saved = localStorage.getItem("athar-saved");
      const parsed: AtharItem[] = saved ? JSON.parse(saved) : [];
      const journal: JournalEntry[] = parsed.map((item, index) => ({
        date: new Date(Date.now() - index * 86400000).toLocaleDateString("ar-SA", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        athar: item,
      }));
      setEntries(journal);
    } catch (e) {
      console.error("خطأ في قراءة السجل:", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const handleClear = () => {
    localStorage.removeItem("athar-saved");
    setEntries([]);
  };

  return (
    <main className="min-h-screen pb-28 bg-athar-bg">
      {/* Header */}
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <CalendarHeart className="w-6 h-6 text-athar-primary" />
          <h1 className="text-2xl font-bold text-athar-primary">سجلي</h1>
        </div>
        {entries.length > 0 && (
          <button
            onClick={handleClear}
            className="p-2 rounded-full bg-white/80 shadow-sm"
            title="مسح السجل"
          >
            <Trash2 className="w-5 h-5 text-red-500" />
          </button>
        )}
      </header>

      <section className="px-4 py-2 space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-athar-primary animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Bookmark className="w-12 h-12 text-athar-muted mx-auto" />
            <p className="text-athar-muted text-sm">لا توجد آثار محفوظة بعد</p>
            <p className="text-xs text-athar-muted">
              احفظ أثرك اليومي ليظهر هنا في سجلك
            </p>
          </div>
        ) : (
          entries.map((entry, index) => (
            <div key={index} className="athar-card space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-athar-muted">{entry.date}</span>
                <span className="text-xs bg-athar-primary/10 text-athar-primary px-2 py-0.5 rounded-full">
                  {entry.athar.category}
                </span>
              </div>
              <p className="text-base font-medium text-athar-text leading-relaxed">
                {entry.athar.text}
              </p>
              <p className="text-xs text-athar-muted">— {entry.athar.source}</p>
            </div>
          ))
        )}
      </section>

      <BottomNav />
    </main>
  );
}
