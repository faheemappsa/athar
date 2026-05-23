"use client";

import { useState, useEffect, useRef } from "react";
import { Share2, Bookmark, RefreshCw, Loader2, Camera, Download } from "lucide-react";
import { fetchDailyAthar } from "@/lib/api";
import type { AtharItem } from "@/lib/api";
import Badge from "./Badge";

export default function AtharCard() {
  const [athar, setAthar] = useState<AtharItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exporting, setExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const exportCardRef = useRef<HTMLDivElement>(null);

  const loadAthar = async () => {
    setLoading(true);
    const data = await fetchDailyAthar();
    setAthar(data);
    setLoading(false);
    // reset saved state for new athar
    setSaved(false);
  };

  // تحميل الأثر أول مرة
  useEffect(() => {
    loadAthar();
  }, []);

  const handleNewAthar = () => {
    setSaved(false);
    loadAthar();
  };

  const handleSave = () => {
    if (!athar) return;
    setSaved(!saved);
    if (!saved) {
      const savedList = JSON.parse(localStorage.getItem("athar-saved") || "[]");
      // منع التكرار
      if (!savedList.find((item: AtharItem) => item.text === athar.text)) {
        savedList.push(athar);
        localStorage.setItem("athar-saved", JSON.stringify(savedList));
      }
    }
  };

  const handleShare = () => {
    if (!athar) return;
    // إظهار خيارات المشاركة
    setShowExportOptions(true);
  };

  const handleExportImage = async () => {
    if (!athar || !exportCardRef.current) return;
    setExporting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(exportCardRef.current, {
        backgroundColor: "#1B4332", // athar-primary
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/png", 1.0);
      });
      if (blob) {
        const file = new File([blob], `athar-${Date.now()}.png`, { type: "image/png" });
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "أثر",
            text: athar.text,
          });
        } else {
          // fallback download
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `athar-${Date.now()}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
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
        url: window.location.href,
      });
    }
  };

  return (
    <>
      <section className="px-4 py-4">
        <div
          ref={cardRef}
          className="relative overflow-hidden bg-gradient-to-b from-athar-primary/5 to-white dark:from-athar-primary/10 dark:to-gray-900 rounded-3xl shadow-lg ring-1 ring-athar-accent/20 dark:ring-athar-accent/10 p-6 space-y-4 border-t-4 border-athar-accent"
        >
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-athar-primary animate-spin" />
            </div>
          ) : athar ? (
            <>
              {/* Category */}
              <div className="flex items-center justify-between">
                <Badge label={athar.category} variant="muted" />
                <span className="text-xs text-athar-muted dark:text-gray-400">أثر اليوم</span>
              </div>

              {/* Athar Text */}
              <div className="text-center py-4">
                <p className="text-xl font-medium text-athar-text dark:text-gray-100 leading-relaxed">
                  {athar.text}
                </p>
                <p className="text-sm text-athar-muted dark:text-gray-400 mt-3">— {athar.source}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleSave}
                  className={`p-3 rounded-full transition-all ${
                    saved ? "bg-athar-primary text-white" : "bg-athar-bg dark:bg-gray-700 text-athar-primary dark:text-athar-accent"
                  }`}
                >
                  <Bookmark className="w-5 h-5" />
                </button>
                <button
                  onClick={handleShare}
                  className="btn-primary flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  مشاركة
                </button>
                <button
                  onClick={handleNewAthar}
                  className="p-3 rounded-full bg-athar-bg dark:bg-gray-700 text-athar-primary dark:text-athar-accent"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
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
            
            <button
              onClick={handleExportImage}
              disabled={exporting}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-athar-accent/10 hover:bg-athar-accent/20 transition-colors"
            >
              <Camera className="w-6 h-6 text-athar-accent" />
              <div className="text-right">
                <p className="font-medium text-athar-text dark:text-gray-200">تصدير كصورة</p>
                <p className="text-xs text-athar-muted dark:text-gray-400">صورة جميلة لمشاركة أثرك في أي مكان</p>
              </div>
            </button>

            <button
              onClick={handleDirectShare}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-athar-primary/10 hover:bg-athar-primary/20 transition-colors"
            >
              <Share2 className="w-6 h-6 text-athar-primary" />
              <div className="text-right">
                <p className="font-medium text-athar-text dark:text-gray-200">مشاركة نصية</p>
                <p className="text-xs text-athar-muted dark:text-gray-400">نسخ النص ومشاركته مباشرة</p>
              </div>
            </button>

            <button
              onClick={() => setShowExportOptions(false)}
              className="w-full py-2 text-sm text-athar-muted dark:text-gray-400 hover:text-athar-text dark:hover:text-gray-200 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* بطاقة التصدير المخفية للـ html2canvas */}
      <div
        ref={exportCardRef}
        className="fixed top-0 left-0 w-[1080px] h-[1920px] z-[-9999] opacity-0 pointer-events-none"
        style={{ direction: "rtl" }}
      >
        {athar && (
          <div
            className="w-full h-full flex flex-col items-center justify-between p-16 text-center"
            style={{
              background: "linear-gradient(135deg, #1B4332, #2D6A4F, #40916C)",
              fontFamily: "Thmanyah, sans-serif",
              color: "white",
            }}
          >
            {/* Header */}
            <div className="space-y-4">
              <h1 className="text-6xl font-extrabold">أثر</h1>
              <p className="text-3xl opacity-80">أثرٌ جارٍ لا ينقطع</p>
            </div>

            {/* Athar Text */}
            <div className="flex-1 flex flex-col items-center justify-center space-y-8 max-w-2xl">
              <span className="text-4xl bg-white/20 px-8 py-3 rounded-full">
                {athar.category}
              </span>
              <p className="text-5xl leading-relaxed font-medium">
                {athar.text}
              </p>
              <p className="text-3xl opacity-70">— {athar.source}</p>
            </div>

            {/* Footer */}
            <div className="space-y-6">
              <p className="text-2xl opacity-60">الوقف الخيري عن مسلم عوده البويني رحمه الله</p>
              <div className="flex items-center justify-center gap-4">
                <div className="w-32 h-32 bg-white rounded-2xl flex items-center justify-center">
                  {/* QR Code placeholder - يمكن إضافة مكتبة qrcode.react لاحقاً */}
                  <span className="text-athar-primary text-sm font-bold">QR</span>
                </div>
                <p className="text-xl">امسح لزيارة التطبيق</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
