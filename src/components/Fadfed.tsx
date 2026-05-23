"use client";

import { useState } from "react";
import {
  Heart, HeartCrack, HeartOff, Frown, CloudRain, Coins, Sword, Home, ShieldQuestion,
  ChevronRight, Share2, RefreshCw, X, BookOpen, ScrollText, Library, Hand
} from "lucide-react";
import { fadfedContent } from "@/lib/fadfed-content";

type Step = "emotions" | "sub-emotions" | "content-type" | "result";

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

  if (!isOpen) return null;

  const reset = () => {
    setStep("emotions");
    setSelectedEmotion(null);
    setSelectedSubEmotion(null);
    setSelectedContentType(null);
    setStoryPart(0);
    onClose();
  };

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

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-sm w-full text-center space-y-5 shadow-2xl animate-scale-up relative max-h-[80vh] overflow-y-auto">
        <button
          onClick={reset}
          className="absolute top-4 left-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 z-10"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

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
      </div>
    </div>
  );
}
