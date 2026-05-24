"use client";
import { useState, useEffect, useRef } from "react";
import { Share2, Bookmark, RefreshCw, Loader2, Camera, Sparkles } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { fetchDailyAthar } from "@/lib/api";
import type { AtharItem } from "@/lib/api";
import Badge from "./Badge";

const APP_URL = "https://athar-sandy.vercel.app";

export default function AtharCard() {
  const [athar, setAthar] = useState<AtharItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exporting, setExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const exportCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(() => {
        console.log("Fonts ready");
      });
    }
  }, []);

  const loadAthar = async () => {
    setLoading(true);
    const data = await fetchDailyAthar();
    setAthar(data);
    setLoading(false);
    setSaved(false);
  };

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
    if (!athar || !exportCardRef.current) return;
    setExporting(true);
    try {
      await document.fonts.ready;
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(exportCardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/png", 1.0);
      });
      if (blob) {
        const file = new File([blob], `اثر-${Date.now()}.png`, { type: "image/png" });
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "أثر",
            text: athar.text,
          });
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `اثر-${Date.now()}.png`;
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
        url: APP_URL,
      });
    }
  };

  return (
    <>
      <section className="px-4 py-4">
        <div
          ref={cardRef}
          className="relative overflow-hidden bg-gradient-to-b from-athar-accent-200 via-athar-card to-athar-primary-50 dark:from-athar-primary-800 dark:via-gray-900 dark:to-gray-900 rounded-3xl shadow-xl shadow-athar-accent-500/5 p-6 space-y-5 border border-athar-accent-300/40 dark:border-athar-primary-700/30 backdrop-blur-sm"
        >
          {/* تاج نوراني علوي */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-athar-accent-400 to-transparent opacity-80"></div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-athar-accent animate-spin" />
            </div>
          ) : athar ? (
            <>
              {/* الترويسة: وسام الفئة */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-athar-accent-200 text-athar-accent-600">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <Badge label={athar.category} variant="accent" />
                </div>
                <span className="text-xs font-medium text-athar-primary-500 dark:text-athar-accent-400 tracking-wide">أثر اليوم</span>
              </div>

              {/* النص الرئيسي (البطل) */}
              <div className="text-center py-8 px-2">
                <p className="text-2xl font-medium text-athar-primary-700 dark:text-gray-100 leading-relaxed">
                  {athar.text}
                </p>
                <p className="text-sm text-athar-accent-600 font-medium dark:text-athar-accent-400 mt-4">— {athar.source}</p>
              </div>

              {/* الأزرار السفلية */}
              <div className="flex items-center justify-center gap-4 pt-2">
                <button
                  onClick={handleSave}
                  className={`p-3 rounded-full transition-all duration-300 ${
                    saved
                      ? "bg-athar-primary-600 text-white shadow-lg scale-105"
                      : "bg-athar-bg-200 dark:bg-gray-700 text-athar-primary-600 dark:text-athar-accent-400 hover:bg-athar-primary-100"
                  }`}
                  title="احفظ في سجلك"
                >
                  <Bookmark className="w-5 h-5" />
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-athar-accent-500 text-white font-medium shadow-lg hover:shadow-xl transition-all active:scale-95 hover:bg-athar-accent-600"
                >
                  <Share2 className="w-4 h-4" />
                  مشاركة
                </button>

                <button
                  onClick={handleNewAthar}
                  className="p-3 rounded-full bg-athar-bg-200 dark:bg-gray-700 text-athar-primary-600 dark:text-athar-accent-400 hover:bg-athar-primary-100 transition-all"
                  title="أثر جديد"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : null}
        </div>
      </section>

      {showExportOptions && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm flex items-end justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-t-3xl p-6 max-w-sm w-full space-y-4 animate-slide-up">
            <h3 className="text-lg font-bold text-athar-text dark:text-gray-200 text-center">مشاركة الأثر</h3>
            <button
              onClick={handleExportImage}
              disabled={exporting}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-athar-accent-100 hover:bg-athar-accent-200 transition-colors"
            >
              <Camera className="w-6 h-6 text-athar-accent-500" />
              <div className="text-right">
                <p className="font-medium text-athar-text dark:text-gray-200">تصدير كصورة</p>
                <p className="text-xs text-athar-text-muted dark:text-gray-400">صورة جميلة لمشاركة أثرك في أي مكان</p>
              </div>
            </button>
            <button
              onClick={handleDirectShare}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-athar-primary-50 hover:bg-athar-primary-100 transition-colors"
            >
              <Share2 className="w-6 h-6 text-athar-primary" />
              <div className="text-right">
                <p className="font-medium text-athar-text dark:text-gray-200">مشاركة نصية</p>
                <p className="text-xs text-athar-text-muted dark:text-gray-400">نسخ النص ومشاركته مباشرة</p>
              </div>
            </button>
            <button
              onClick={() => setShowExportOptions(false)}
              className="w-full py-2 text-sm text-athar-text-muted dark:text-gray-400 hover:text-athar-text dark:hover:text-gray-200 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* بطاقة التصدير - صندوق صغير يمنع التمدد */}
      <div className="fixed top-0 left-0 w-[1px] h-[1px] opacity-0 pointer-events-none overflow-hidden" style={{ direction: "rtl" }}>
        {athar && (
          <div
            ref={exportCardRef}
            className="w-[1080px] h-[1920px] relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #0F2A1C 0%, #1B4332 40%, #2D6A4F 70%, #D4A373 100%)",
              fontFamily: "Thmanyah, sans-serif",
              color: "white",
              isolation: "isolate",
            }}
          >
            <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                </pattern>
                <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              <rect width="100%" height="100%" fill="url(#dots)" />
            </svg>

            <div className="absolute top-8 left-8 right-8 bottom-8 border border-white/20 rounded-[50px] pointer-events-none"></div>
            <div className="absolute top-10 left-10 right-10 bottom-10 border border-white/10 rounded-[44px] pointer-events-none"></div>

            <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-16 text-center">
              <div className="space-y-4">
                <h1 className="text-8xl font-extrabold tracking-[0.2em] leading-none" style={{ textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>
                  أثر
                </h1>
                <p className="text-3xl font-medium opacity-90 tracking-wide">أثرٌ جارٍ لا ينقطع</p>
              </div>

              <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>

              <div className="flex-1 flex flex-col items-center justify-center max-w-2xl space-y-10">
                <span className="text-4xl bg-white/20 px-10 py-4 rounded-full border border-white/30 shadow-lg">
                  {athar.category}
                </span>
                <p className="text-5xl leading-relaxed font-medium" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>
                  {athar.text}
                </p>
                <p className="text-3xl opacity-80 italic">— {athar.source}</p>
              </div>

              <div className="space-y-8">
                <p className="text-2xl opacity-70">الوقف الخيري عن مسلم عوده البويني رحمه الله</p>
                <div className="inline-flex items-center gap-6 bg-black/20 backdrop-blur-sm rounded-3xl p-5 border border-white/20">
                  <div className="w-32 h-32 bg-white rounded-2xl flex items-center justify-center p-2 shadow-xl">
                    <QRCodeSVG value={APP_URL} size={110} level="M" />
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-2xl font-medium">اضغط مطولاً لزيارة التطبيق</p>
                    <p className="text-lg opacity-60">{APP_URL.replace("https://", "")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
