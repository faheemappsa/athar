"use client";

import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";

interface ShareCardProps {
  isOpen: boolean;
  onClose: () => void;
  text: string;
  source?: string;
  category?: string;
  appUrl?: string;
}

export default function ShareCard({ isOpen, onClose, text, source, category, appUrl = "https://athar-sandy.vercel.app" }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleExportImage = async () => {
    if (!cardRef.current) return;
    try {
      await document.fonts.ready;
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/png", 1.0);
      });
      if (blob) {
        const file = new File([blob], `athar-share-${Date.now()}.png`, { type: "image/png" });
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "أثر — حكمة",
            text: text,
          });
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `athar-share-${Date.now()}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      }
    } catch (e) {
      console.error("Error exporting share card:", e);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl animate-scale-up">
        <h3 className="text-lg font-bold text-athar-text dark:text-gray-200">معاينة الصورة</h3>
        <p className="text-xs text-athar-muted dark:text-gray-400">هذه الصورة ستظهر في مشاركتك</p>

        {/* حاوية البطاقة (محتوى الصورة النهائية) */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700">
          <div
            ref={cardRef}
            className="w-full aspect-[9/16] relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #0F2A1C 0%, #1B4332 40%, #2D6A4F 70%, #D4A373 100%)",
              fontFamily: "Thmanyah, sans-serif",
              color: "white",
              direction: "rtl",
            }}
          >
            {/* خلفية زخرفية */}
            <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="shareGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="white" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#shareGrid)" />
            </svg>

            {/* إطار ذهبي */}
            <div className="absolute top-4 left-4 right-4 bottom-4 border border-white/10 rounded-[40px] pointer-events-none"></div>

            {/* المحتوى */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-8 text-center">
              {/* الترويسة */}
              <div className="space-y-4">
                <h1 className="text-6xl font-extrabold tracking-[0.15em] leading-none" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>
                  أثر
                </h1>
                <p className="text-xl opacity-80">أثرٌ جارٍ لا ينقطع</p>
              </div>

              {/* الفئة إن وجدت */}
              {category && (
                <span className="text-xl bg-white/20 px-6 py-2 rounded-full border border-white/20">
                  {category}
                </span>
              )}

              {/* النص الرئيسي (الحكمة أو الأثر) */}
              <div className="flex-1 flex items-center justify-center">
                <p className="text-3xl leading-relaxed font-medium text-center" style={{ textShadow: "0 1px 5px rgba(0,0,0,0.2)" }}>
                  {text}
                </p>
              </div>

              {/* المصدر إن وجد */}
              {source && (
                <p className="text-lg opacity-70 italic">— {source}</p>
              )}

              {/* التذييل */}
              <div className="space-y-4">
                <div className="inline-flex items-center gap-4 bg-black/20 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-lg">
                    <QRCodeSVG value={appUrl} size={88} level="M" />
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-lg font-medium">اضغط مطولاً لزيارة التطبيق</p>
                    <p className="text-sm opacity-60">{appUrl.replace("https://", "")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleExportImage}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          تصدير ومشاركة
        </button>
        <button
          onClick={onClose}
          className="w-full py-2 text-sm text-athar-muted dark:text-gray-400 hover:underline"
        >
          إلغاء
        </button>
      </div>
    </div>
  );
}
