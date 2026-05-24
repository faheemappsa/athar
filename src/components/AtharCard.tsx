"use client";
import { useState, useEffect, useRef } from "react";
import { Share2, Bookmark, RefreshCw, Loader2, Camera, Sparkles, Palette } from "lucide-react";
import { fetchDailyAthar } from "@/lib/api";
import type { AtharItem } from "@/lib/api";
import Badge from "./Badge";

const APP_URL = "https://athar-sandy.vercel.app";

// نظام الثيمات
const themes = [
  { id: "emerald", name: "زمردي", bg: "linear-gradient(160deg, #0F2A1C 0%, #1B4332 40%, #2D6A4F 100%)", textColor: "white" },
  { id: "dawn", name: "فجر", bg: "linear-gradient(160deg, #D4A373 0%, #B8875A 40%, #2D6A4F 100%)", textColor: "white" },
  { id: "midnight", name: "مساء", bg: "linear-gradient(160deg, #0A0F0C 0%, #1A1F2E 60%, #111827 100%)", textColor: "white" },
  { id: "sand", name: "رملي", bg: "linear-gradient(160deg, #F5F5F0 0%, #EDE8DC 60%, #D4A373 100%)", textColor: "#1B4332" },
];

export default function AtharCard() {
  const [athar, setAthar] = useState<AtharItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(themes[0]);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(() => { console.log("Fonts ready"); });
    }
  }, []);

  const loadAthar = async () => {
    setLoading(true);
    const data = await fetchDailyAthar();
    setAthar(data);
    setLoading(false);
    setSaved(false);
  };

  useEffect(() => { loadAthar(); }, []);

  const handleNewAthar = () => { setSaved(false); loadAthar(); };

  const handleSave = () => {
    if (!athar) return;
    setSaved(!saved);
    if (!saved) {
      const savedList = JSON.parse(localStorage.getItem("athar-saved") || "[]");
      if (!savedList.find((item: AtharItem) => item.text === athar.text)) {
        savedList.push(athar);
        localStorage.setItem("athar-saved", JSON.stringify(savedList));
      }
    }
  };

  const handleShare = () => {
    if (!athar) return;
    setShowExportOptions(true);
  };

  const handleExportImage = async () => {
    if (!athar) return;
    setExporting(true);
    try {
      const params = new URLSearchParams({
        text: athar.text,
        source: athar.source,
        theme: selectedTheme.id,
      });
      const response = await fetch(`/api/og?${params.toString()}`);
      const blob = await response.blob();

      const file = new File([blob], `اثر-${Date.now()}.png`, { type: "image/png" });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "أثر", text: athar.text });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `اثر-${Date.now()}.png`;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error("Error exporting image:", e);
    }
    setExporting(false);
    setShowExportOptions(false);
  };

  const handleDirectShare = () => {
    if (!athar) return;
    if (navigator.share) {
      navigator.share({
        title: "أثر — أثرٌ جارٍ لا ينقطع",
        text: `${athar.text}\n— ${athar.source}`,
        url: APP_URL,
      });
    }
  };

  return (
    <>
      {/* بطاقة العرض الرئيسية (كما هي) */}
      <section className="px-4 py-4">
        <div ref={cardRef} className="relative overflow-hidden bg-gradient-to-b from-athar-accent-200 via-athar-card to-athar-primary-50 dark:from-athar-primary-800 dark:via-gray-900 dark:to-gray-900 rounded-3xl shadow-xl shadow-athar-accent-500/5 p-6 space-y-5 border border-athar-accent-300/40 dark:border-athar-primary-700/30 backdrop-blur-sm">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-athar-accent-400 to-transparent opacity-80"></div>
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 text-athar-accent animate-spin" /></div>
          ) : athar ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-athar-accent-200 text-athar-accent-600"><Sparkles className="w-4 h-4" /></span>
                  <Badge label={athar.category} variant="accent" />
                </div>
                <span className="text-xs font-medium text-athar-primary-500 dark:text-athar-accent-400 tracking-wide">أثر اليوم</span>
              </div>
              <div className="text-center py-8 px-2">
                <p className="text-2xl font-medium text-athar-primary-700 dark:text-gray-100 leading-relaxed">{athar.text}</p>
                <p className="text-sm text-athar-accent-600 font-medium dark:text-athar-accent-400 mt-4">— {athar.source}</p>
              </div>
              <div className="flex items-center justify-center gap-4 pt-2">
                <button onClick={handleSave} className={`p-3 rounded-full transition-all duration-300 ${saved ? "bg-athar-primary-600 text-white shadow-lg scale-105" : "bg-athar-bg-200 dark:bg-gray-700 text-athar-primary-600 dark:text-athar-accent-400 hover:bg-athar-primary-100"}`} title="احفظ في سجلك"><Bookmark className="w-5 h-5" /></button>
                <button onClick={handleShare} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-athar-accent-500 text-white font-medium shadow-lg hover:shadow-xl transition-all active:scale-95 hover:bg-athar-accent-600"><Share2 className="w-4 h-4" /> مشاركة</button>
                <button onClick={handleNewAthar} className="p-3 rounded-full bg-athar-bg-200 dark:bg-gray-700 text-athar-primary-600 dark:text-athar-accent-400 hover:bg-athar-primary-100 transition-all" title="أثر جديد"><RefreshCw className="w-5 h-5" /></button>
              </div>
            </>
          ) : null}
        </div>
      </section>

      {/* مودال خيارات التصدير */}
      {showExportOptions && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm flex items-end justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-t-3xl p-6 max-w-sm w-full space-y-4 animate-slide-up">
            <h3 className="text-lg font-bold text-athar-text dark:text-gray-200 text-center">مشاركة الأثر</h3>
            
            {/* اختيار الثيم */}
            <div className="space-y-2">
              <p className="text-xs text-athar-muted">اختيار الثيم:</p>
              <div className="flex gap-2 justify-center">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${selectedTheme.id === theme.id ? "border-athar-accent-500 scale-110" : "border-gray-300 dark:border-gray-600"}`}
                    style={{ background: theme.bg.split("160deg, ")[1]?.split(" 0%")[0] || theme.bg }}
                    title={theme.name}
                  />
                ))}
              </div>
            </div>

            <button onClick={handleExportImage} disabled={exporting} className="w-full flex items-center gap-3 p-4 rounded-xl bg-athar-accent-100 hover:bg-athar-accent-200 transition-colors">
              <Camera className="w-6 h-6 text-athar-accent-500" />
              <div className="text-right">
                <p className="font-medium text-athar-text dark:text-gray-200">تصدير كصورة</p>
                <p className="text-xs text-athar-text-muted dark:text-gray-400">صورة فاخرة بمقاس ستوري</p>
              </div>
            </button>
            <button onClick={handleDirectShare} className="w-full flex items-center gap-3 p-4 rounded-xl bg-athar-primary-50 hover:bg-athar-primary-100 transition-colors">
              <Share2 className="w-6 h-6 text-athar-primary" />
              <div className="text-right">
                <p className="font-medium text-athar-text dark:text-gray-200">مشاركة نصية</p>
                <p className="text-xs text-athar-text-muted dark:text-gray-400">نسخ النص ومشاركته مباشرة</p>
              </div>
            </button>
            <button onClick={() => setShowExportOptions(false)} className="w-full py-2 text-sm text-athar-text-muted dark:text-gray-400 hover:text-athar-text dark:hover:text-gray-200 transition-colors">إلغاء</button>
          </div>
        </div>
      )}
    </>
  );
}
