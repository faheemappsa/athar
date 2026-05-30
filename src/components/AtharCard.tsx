"use client";
import { useState, useEffect, useRef } from "react";
import { Share2, Bookmark, RefreshCw, Loader2, Camera, Sparkles } from "lucide-react";
import type { AtharItem } from "@/lib/api";
import Badge from "./Badge";

const APP_URL = "https://athar-sandy.vercel.app";

// ============================================================
// 1. نظام مصادر المحتوى المتعددة (APIs + احتياطي داخلي)
// ============================================================

interface ContentItem {
  text: string;
  source: string;
  category: string;
  type: "hadith" | "quran" | "dua";
}

// قائمة احتياطية داخلية (أدعية وأذكار) في حالة فشل الـ APIs
const fallbackContents: ContentItem[] = [
  { text: "اللهم اجعل هذا الأثر صدقة جارية عن والدي ووالديّ المسلمين", source: "دعاء المستخدم", category: "دعاء", type: "dua" },
  { text: "رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا", source: "سورة الإسراء: 24", category: "آية", type: "quran" },
  { text: "مَنْ دَلَّ عَلَى خَيْرٍ فَلَهُ مِثْلُ أَجْرِ فَاعِلِهِ", source: "صحيح مسلم", category: "حديث", type: "hadith" },
  { text: "اللهم اغفر له وارحمه وعافه واعف عنه", source: "دعاء للميت", category: "دعاء", type: "dua" },
  { text: "وَأَنْ لَيْسَ لِلْإِنْسَانِ إِلَّا مَا سَعَىٰ", source: "سورة النجم: 39", category: "آية", type: "quran" },
];

// جلب حديث عشوائي من API عربي فقط (Aladhan)
async function fetchRandomHadith(): Promise<ContentItem | null> {
  try {
    const response = await fetch("https://api.aladhan.com/v1/randomHadith");
    const data = await response.json();
    if (data.code === 200 && data.data) {
      const hadith = data.data;
      return {
        text: hadith.hadith,
        source: `${hadith.book} - ${hadith.reference}`,
        category: "حديث نبوي",
        type: "hadith",
      };
    }
  } catch (error) {
    console.error("فشل جلب الحديث:", error);
  }
  return null;
}

// جلب آية عشوائية من API نظيف (quranapi)
async function fetchRandomAyah(): Promise<ContentItem | null> {
  try {
    const response = await fetch("https://quranapi.pages.dev/api/random");
    const data = await response.json();
    if (data && data.text && data.surah) {
      return {
        text: data.text,
        source: `سورة ${data.surah.name} - الآية ${data.ayah}`,
        category: "آية قرآنية",
        type: "quran",
      };
    }
  } catch (error) {
    console.error("فشل جلب الآية:", error);
  }
  return null;
}

// الحصول على محتوى عشوائي مع منع التكرار (سجل زمني)
const getRandomContent = async (): Promise<ContentItem> => {
  const historyKey = "athar-content-history";
  const history: string[] = JSON.parse(localStorage.getItem(historyKey) || "[]");
  
  let newContent: ContentItem | null = null;
  const randomType = Math.random() < 0.5 ? "hadith" : "quran";
  if (randomType === "hadith") {
    newContent = await fetchRandomHadith();
  } else {
    newContent = await fetchRandomAyah();
  }
  
  if (!newContent) {
    const availableFallbacks = fallbackContents.filter(c => !history.includes(c.text));
    newContent = availableFallbacks.length > 0 
      ? availableFallbacks[Math.floor(Math.random() * availableFallbacks.length)]
      : fallbackContents[Math.floor(Math.random() * fallbackContents.length)];
  }
  
  if (history.includes(newContent.text)) {
    const secondAttempt = randomType === "hadith" ? await fetchRandomHadith() : await fetchRandomAyah();
    if (secondAttempt && !history.includes(secondAttempt.text)) {
      newContent = secondAttempt;
    } else {
      const freshFallback = fallbackContents.find(c => !history.includes(c.text));
      if (freshFallback) newContent = freshFallback;
    }
  }
  
  const newHistory = [newContent.text, ...history].slice(0, 7);
  localStorage.setItem(historyKey, JSON.stringify(newHistory));
  return newContent;
};

// ============================================================
// 2. نظام الخلفية الديناميكية حسب الوقت الحقيقي (تم تفتيح الليل)
// ============================================================
const getDynamicBackground = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) {
    return "bg-gradient-to-br from-amber-50 via-amber-100/30 to-white dark:from-amber-950/30 dark:via-amber-900/20 dark:to-gray-900";
  } else if (hour >= 11 && hour < 16) {
    return "bg-gradient-to-br from-emerald-50 via-teal-50/30 to-white dark:from-emerald-950/30 dark:via-teal-900/20 dark:to-gray-900";
  } else if (hour >= 16 && hour < 20) {
    return "bg-gradient-to-br from-sky-50 via-blue-50/30 to-white dark:from-sky-950/30 dark:via-blue-900/20 dark:to-gray-900";
  } else {
    // ليل: تدرج رمادي فاتح (بدلاً من الداكن جداً)
    return "bg-gradient-to-br from-gray-800 via-gray-900/50 to-gray-950 dark:from-gray-800 dark:via-gray-900/50 dark:to-gray-950";
  }
};

// ============================================================
// 3. المكون الرئيسي
// ============================================================
export default function AtharCard() {
  const [athar, setAthar] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exporting, setExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const [bgClass, setBgClass] = useState(getDynamicBackground());
  
  useEffect(() => {
    const updateBg = () => setBgClass(getDynamicBackground());
    updateBg();
    const interval = setInterval(updateBg, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  
  const loadAthar = async () => {
    setLoading(true);
    const content = await getRandomContent();
    setAthar(content);
    setLoading(false);
    setSaved(false);
  };
  
  useEffect(() => { loadAthar(); }, []);
  
  const handleNewAthar = () => { loadAthar(); };
  
  const handleSave = () => {
    if (!athar) return;
    setSaved(!saved);
    if (!saved) {
      const savedList = JSON.parse(localStorage.getItem("athar-saved") || "[]");
      if (!savedList.find((item: ContentItem) => item.text === athar.text)) {
        savedList.push(athar);
        localStorage.setItem("athar-saved", JSON.stringify(savedList));
      }
    }
  };
  
  const handleShare = () => setShowExportOptions(true);
  
  const handleExportImage = async () => {
    if (!athar) return;
    setExporting(true);
    try {
      const params = new URLSearchParams({
        text: athar.text,
        source: athar.source,
        type: athar.type,
      });
      const response = await fetch(`/api/share-image?${params.toString()}`);
      if (!response.ok) throw new Error("فشل إنشاء الصورة");
      const blob = await response.blob();
      const file = new File([blob], `اثر-${Date.now()}.png`, { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "أثر", text: athar.text });
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
    } catch (e) {
      console.error("Error exporting image:", e);
      alert("تعذر تصدير الصورة. سيتم إصلاح هذه الميزة قريبًا.");
    }
    setExporting(false);
    setShowExportOptions(false);
  };
  
  const handleDirectShare = () => {
    if (!athar) return;
    const shareText = `${athar.text}\n— ${athar.source}\n\n#أثر_لا_ينقطع\n${APP_URL}`;
    if (navigator.share) {
      navigator.share({
        title: "أثر — أثرٌ جارٍ لا ينقطع",
        text: shareText,
        url: APP_URL,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert("تم نسخ النص بنجاح");
    }
  };
  
  return (
    <>
      <section className="px-4 py-4">
        <div
          ref={cardRef}
          className={`relative overflow-hidden rounded-3xl shadow-2xl p-6 space-y-5 border ${bgClass} border-athar-primary-100/30 dark:border-gray-700 transition-all duration-700`}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-athar-accent-400 to-transparent opacity-80"></div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-athar-accent-500 animate-spin" />
            </div>
          ) : athar ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-athar-accent-100 text-athar-accent-600">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <Badge label={athar.category} variant="accent" />
                </div>
                <span className="text-xs font-medium text-athar-primary-500 dark:text-athar-accent-400 tracking-wide">أثر اليوم</span>
              </div>
              
              <div className="text-center py-8 px-2">
                <p className="text-2xl font-medium text-athar-text dark:text-gray-100 leading-relaxed">{athar.text}</p>
                <p className="text-sm text-athar-accent-600 font-medium dark:text-athar-accent-400 mt-4">— {athar.source}</p>
              </div>
              
              <div className="flex items-center justify-center gap-6 pt-2">
                <button
                  onClick={handleSave}
                  className={`p-3.5 rounded-full transition-all duration-300 touch-manipulation active:scale-95 ${
                    saved
                      ? "bg-athar-primary-600 text-white shadow-lg scale-105"
                      : "bg-athar-bg-200 dark:bg-gray-700 text-athar-primary-600 dark:text-athar-accent-400 hover:bg-athar-primary-100"
                  }`}
                  style={{ minWidth: "44px", minHeight: "44px" }}
                  title="احفظ في سجلك"
                >
                  <Bookmark className="w-5 h-5" />
                </button>
                
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-athar-accent-500 text-white font-medium shadow-lg hover:shadow-xl transition-all active:scale-95 touch-manipulation"
                  style={{ minHeight: "44px" }}
                >
                  <Share2 className="w-5 h-5" />
                  <span>مشاركة</span>
                </button>
                
                <button
                  onClick={handleNewAthar}
                  className="p-3.5 rounded-full bg-athar-bg-200 dark:bg-gray-700 text-athar-primary-600 dark:text-athar-accent-400 hover:bg-athar-primary-100 transition-all touch-manipulation active:scale-95"
                  style={{ minWidth: "44px", minHeight: "44px" }}
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
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-athar-accent-100 hover:bg-athar-accent-200 transition-colors disabled:opacity-50"
            >
              <Camera className="w-6 h-6 text-athar-accent-500" />
              <div className="text-right">
                <p className="font-medium text-athar-text dark:text-gray-200">تصدير كصورة</p>
                <p className="text-xs text-athar-text-muted dark:text-gray-400">صورة فاخرة بمقاس ستوري</p>
              </div>
            </button>
            
            <button
              onClick={handleDirectShare}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-athar-primary-50 hover:bg-athar-primary-100 transition-colors"
            >
              <Share2 className="w-6 h-6 text-athar-primary-500" />
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
    </>
  );
}
