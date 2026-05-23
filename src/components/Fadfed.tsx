"use client";

import { useState, useRef } from "react";
import {
  Heart, HeartCrack, HeartOff, Frown, CloudRain, Coins, Sword, Home, ShieldQuestion,
  ChevronRight, Share2, RefreshCw, X, BookOpen, ScrollText, Library, Hand,
  Send, MessageCircle, Sparkles
} from "lucide-react";
import { fadfedContent } from "@/lib/fadfed-content";
import { analyzeLocally, getMainEmotions, EmotionResult } from "@/lib/analyzer";
import { getRandomWisdom, Wisdom } from "@/lib/wisdom-library";

type Step = "emotions" | "sub-emotions" | "content-type" | "result" | "free-text";

const emotions = [
  { id: "sadness", label: "حزين", icon: <Frown className="w-8 h-8" />, color: "text-athar-muted" },
  { id: "heartbreak", label: "مجروح", icon: <HeartCrack className="w-8 h-8" />, color: "text-athar-accent" },
  { id: "loss", label: "فاقد", icon: <HeartOff className="w-8 h-8" />, color: "text-gray-700 dark:text-gray-300" },
  { id: "anxiety", label: "مهموم", icon: <CloudRain className="w-8 h-8" />, color: "text-indigo-400" },
  { id: "financial", label: "هموم مالية", icon: <Coins className="w-8 h-8" />, color: "text-yellow-500" },
  { id: "injustice", label: "مظلوم", icon: <Sword className="w-8 h-8" />, color: "text-athar-primary" },
  { id: "family", label: "مشاكل أسرية", icon: <Home className="w-8 h-8" />, color: "text-orange-400" },
  { id: "love", label: "حب وشكر", icon: <Heart className="w-8 h-8" />, color: "text-red-400" },
  { id: "confused", label: "مشتت", icon: <ShieldQuestion className="w-8 h-8" />, color: "text-purple-400" },
];

const subEmotions: Record<string, { id: string; label: string }[]> = {
  sadness: [{ id: "general", label: "حزين" }, { id: "regret", label: "ندمان" }, { id: "loneliness", label: "وحيد" }],
  heartbreak: [{ id: "betrayal", label: "خيانة" }, { id: "breakup", label: "فراق" }, { id: "hurt", label: "مجروح" }],
  loss: [{ id: "death", label: "فقدت شخصاً" }, { id: "loss_health", label: "فقدت صحتي" }, { id: "loss_hope", label: "فاقد الأمل" }],
  anxiety: [{ id: "future", label: "خائف من المستقبل" }, { id: "stress", label: "مضغوط" }, { id: "overthinking", label: "كثير التفكير" }],
  financial: [{ id: "debt", label: "ديون" }, { id: "poverty", label: "فقر" }, { id: "job", label: "فقدان وظيفة" }],
  injustice: [{ id: "oppression", label: "ظلم واقع علي" }, { id: "anger", label: "غضب" }, { id: "revenge", label: "أريد الانتقام" }],
  family: [{ id: "divorce", label: "طلاق" }, { id: "kids", label: "مشاكل أطفال" }, { id: "parents", label: "مشاكل أهل" }],
  love: [{ id: "grateful", label: "شاكر" }, { id: "miss", label: "مشتاق" }, { id: "love", label: "أحب" }],
  confused: [{ id: "lost", label: "تائه" }, { id: "doubt", label: "في شك" }, { id: "purpose", label: "أبحث عن هدفي" }],
};

const contentTypes = [
  { id: "ayah", label: "آية", icon: <BookOpen className="w-6 h-6" /> },
  { id: "hadith", label: "حديث", icon: <ScrollText className="w-6 h-6" /> },
  { id: "story", label: "قصة", icon: <Library className="w-6 h-6" /> },
  { id: "dua", label: "دعاء", icon: <Hand className="w-6 h-6" /> },
];

interface FadfedProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Fadfed({ isOpen, onClose }: FadfedProps) {
  const [step, setStep] = useState<Step>("emotions");
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [selectedSubEmotion, setSelectedSubEmotion] = useState<string | null>(null);
  const [selectedContentType, setSelectedContentType] = useState<string | null>(null);
  const [storyPart, setStoryPart] = useState(0);
  
  // حالات جديدة لنظام الكتابة الحرة
  const [freeText, setFreeText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showComfortMessage, setShowComfortMessage] = useState(false);
  const [showWisdomCard, setShowWisdomCard] = useState(false);
  const [comfortMessage, setComfortMessage] = useState("");
  const [selectedWisdom, setSelectedWisdom] = useState<Wisdom | null>(null);
  const [freeTextEmotions, setFreeTextEmotions] = useState<EmotionResult[]>([]);

  const freeTextRef = useRef<HTMLTextAreaElement>(null);

  if (!isOpen) return null;

  const reset = () => {
    setStep("emotions");
    setSelectedEmotion(null);
    setSelectedSubEmotion(null);
    setSelectedContentType(null);
    setStoryPart(0);
    setFreeText("");
    setIsAnalyzing(false);
    setShowComfortMessage(false);
    setShowWisdomCard(false);
    setComfortMessage("");
    setSelectedWisdom(null);
    setFreeTextEmotions([]);
    onClose();
  };

  // المنطق القديم للاختيارات
  const contentKey = selectedEmotion && selectedSubEmotion && selectedContentType
    ? `${selectedEmotion}-${selectedSubEmotion}-${selectedContentType}`
    : null;

  const currentContent = fadfedContent[contentKey || ""] || {
    title: "مواساة",
    body: "استعن بالله ولا تعجز، واعلم أن مع العسر يسراً.",
  };
  const isStory = selectedContentType === "story" && currentContent.parts;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentContent.title,
        text: isStory ? currentContent.parts![storyPart] : currentContent.body,
        url: window.location.href,
      });
    }
  };

  // نظام الكتابة الحرة الجديد
  const handleFreeTextSubmit = () => {
    if (!freeText.trim()) return;

    setIsAnalyzing(true);
    setShowWisdomCard(false);

    // تحليل النص محلياً
    const emotions = analyzeLocally(freeText);
    const mainEmotions = getMainEmotions(emotions);
    setFreeTextEmotions(emotions);

    // إظهار رسالة الطبطبة
    setComfortMessage("وش فيك يا بعدي؟ أنا معك... فضفض براحتك. أنا هنا أسمعك.");
    setShowComfortMessage(true);

    // اختيار حكمة مناسبة
    setTimeout(() => {
      const wisdom = getRandomWisdom(mainEmotions);
      setSelectedWisdom(wisdom);
      setShowWisdomCard(true);
      setIsAnalyzing(false);
      setFreeText(""); // مسح النص لإعطاء إحساس بالأمان
    }, 1500);
  };

  const handleComfortShare = () => {
    if (selectedWisdom && navigator.share) {
      navigator.share({
        title: "حكمة من فضفض لأثر",
        text: selectedWisdom.text,
        url: window.location.href,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-sm w-full text-center space-y-5 shadow-2xl animate-scale-up relative max-h-[85vh] overflow-y-auto">
        <button
          onClick={reset}
          className="absolute top-4 left-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 z-10"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        {/* عرض أيقونات المشاعر دائماً في الأعلى، ما لم نكن في وضع "الكتابة الحرة" */}
        {step !== "free-text" && !showComfortMessage && (
          <>
            {step === "emotions" && (
              <>
                <h3 className="text-xl font-bold text-athar-text dark:text-gray-200 pt-2">كيف تشعر اليوم؟</h3>
                <div className="grid grid-cols-3 gap-3">
                  {emotions.map((emotion) => (
                    <button
                      key={emotion.id}
                      onClick={() => { setSelectedEmotion(emotion.id); setStep("sub-emotions"); }}
                      className="flex flex-col items-center gap-1 p-3 rounded-xl bg-athar-bg dark:bg-gray-800 hover:shadow-md transition-all active:scale-95"
                    >
                      <span className={emotion.color}>{emotion.icon}</span>
                      <span className="text-xs font-medium text-athar-text dark:text-gray-200">{emotion.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === "sub-emotions" && selectedEmotion && (
              <>
                <h3 className="text-lg font-bold text-athar-text dark:text-gray-200 pt-2">تفضل، قرب أكثر</h3>
                <div className="space-y-2">
                  {subEmotions[selectedEmotion]?.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => { setSelectedSubEmotion(sub.id); setStep("content-type"); }}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-athar-bg dark:bg-gray-800 hover:shadow-md transition-all active:scale-95"
                    >
                      <span className="text-sm font-medium text-athar-text dark:text-gray-200">{sub.label}</span>
                      <ChevronRight className="w-4 h-4 text-athar-muted" />
                    </button>
                  ))}
                </div>
                <button onClick={() => setStep("emotions")} className="text-xs text-athar-muted hover:underline">رجوع</button>
              </>
            )}

            {step === "content-type" && selectedSubEmotion && (
              <>
                <h3 className="text-lg font-bold text-athar-text dark:text-gray-200 pt-2">كيف نحب نواسيك؟</h3>
                <div className="grid grid-cols-2 gap-3">
                  {contentTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => { setSelectedContentType(type.id); setStoryPart(0); setStep("result"); }}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl bg-athar-bg dark:bg-gray-800 hover:shadow-md transition-all active:scale-95"
                    >
                      <span className="text-athar-primary">{type.icon}</span>
                      <span className="text-sm font-medium text-athar-text dark:text-gray-200">{type.label}</span>
                    </button>
                  ))}
                </div>
                <button onClick={() => setStep("sub-emotions")} className="text-xs text-athar-muted hover:underline">رجوع</button>
              </>
            )}

            {step === "result" && (
              <>
                <h3 className="text-xl font-bold text-athar-text dark:text-gray-200 pt-2">{currentContent.title}</h3>
                <div className="bg-athar-bg dark:bg-gray-800 rounded-2xl p-4 text-sm leading-relaxed text-athar-text dark:text-gray-300">
                  {isStory ? (
                    <>
                      <p>{currentContent.parts![storyPart]}</p>
                      {storyPart < currentContent.parts!.length - 1 && (
                        <button
                          onClick={() => setStoryPart(prev => prev + 1)}
                          className="mt-3 flex items-center gap-1 text-athar-primary text-xs font-medium hover:underline"
                        >
                          الجزء التالي <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </>
                  ) : (
                    <p>{currentContent.body}</p>
                  )}
                </div>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-athar-accent text-white text-xs font-medium hover:bg-athar-accent/90 transition-all active:scale-95"
                  >
                    <Share2 className="w-4 h-4" />
                    شارك الأثر
                  </button>
                  <button
                    onClick={() => setStep("emotions")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-athar-bg dark:bg-gray-700 text-athar-text dark:text-gray-200 text-xs font-medium hover:shadow-md transition-all active:scale-95"
                  >
                    <RefreshCw className="w-4 h-4" />
                    فضفض مجدداً
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* مربع "اكتب وعبّر" (يظهر دائمًا في الأسفل ما لم نكن نعرض نتيجة أو طبطبة) */}
        {!showComfortMessage && !showWisdomCard && step !== "result" && (
          <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            <p className="text-sm font-medium text-athar-text dark:text-gray-200">أو... اكتب وعبّر براحتك</p>
            <textarea
              ref={freeTextRef}
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              placeholder="اكتب وعبّر... هنا مساحتك أنت"
              rows={3}
              className="w-full p-3 rounded-xl bg-athar-bg dark:bg-gray-800 text-athar-text dark:text-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-athar-accent/50"
            />
            <p className="text-xs text-gray-400 dark:text-gray-600 text-center">
              لا نقرأ ولا نحفظ شيئاً. هذه مساحتك الخاصة. كل ما تكتبه يبقى عندك.
            </p>
            <button
              onClick={handleFreeTextSubmit}
              disabled={!freeText.trim() || isAnalyzing}
              className="w-full py-2.5 rounded-xl bg-athar-accent text-white font-medium flex items-center justify-center gap-2 hover:bg-athar-accent/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  جارٍ الإرسال...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  أرسل
                </>
              )}
            </button>
          </div>
        )}

        {/* رسالة الطبطبة */}
        {showComfortMessage && !showWisdomCard && (
          <div className="space-y-4 animate-fade-in pt-2">
            <div className="flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-athar-accent" />
            </div>
            <div className="bg-athar-accent/10 dark:bg-athar-accent/20 rounded-2xl p-4">
              <p className="text-sm font-medium text-athar-text dark:text-gray-200 leading-relaxed">
                {comfortMessage}
              </p>
            </div>
            <button
              onClick={() => {
                setShowComfortMessage(false);
                setShowWisdomCard(true);
              }}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              أرني الحكمة
            </button>
          </div>
        )}

        {/* بطاقة الحكمة */}
        {showWisdomCard && selectedWisdom && (
          <div className="space-y-5 animate-fade-in pt-2">
            <div className="text-center">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-athar-accent/20 text-athar-accent">
                <Sparkles className="w-6 h-6" />
              </span>
            </div>
            <h3 className="text-xl font-bold text-athar-text dark:text-gray-200">حكمة لك</h3>
            <div className="bg-athar-bg dark:bg-gray-800 rounded-2xl p-4 text-sm leading-relaxed text-athar-text dark:text-gray-300">
              <p>{selectedWisdom.text}</p>
              {selectedWisdom.source && (
                <p className="text-xs text-athar-muted mt-2">— {selectedWisdom.source}</p>
              )}
            </div>
            <div className="flex gap-2 justify-center">
              <button
                onClick={handleComfortShare}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-athar-accent text-white text-xs font-medium hover:bg-athar-accent/90 transition-all active:scale-95"
              >
                <Share2 className="w-4 h-4" />
                شارك الحكمة
              </button>
              <button
                onClick={() => {
                  setShowWisdomCard(false);
                  setShowComfortMessage(false);
                  setFreeText("");
                  setStep("emotions");
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-athar-bg dark:bg-gray-700 text-athar-text dark:text-gray-200 text-xs font-medium hover:shadow-md transition-all active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                فضفض مجدداً
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
