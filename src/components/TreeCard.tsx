"use client";

import { useState, useEffect } from "react";
import { Sparkles, TreePine, Leaf, Trophy, ChevronRight, Sprout, Flower2, Trees, Award, Flame, Zap } from "lucide-react";
import { getRandomChallenge, getTreeStage, refreshLibrary } from "@/lib/challenges";
import type { DhikrChallenge } from "@/lib/challenges";
import DhikrPopup from "./DhikrPopup";

interface TreeCardProps {
  userName?: string | null;
}

// أيقونات SVG متحركة حسب مرحلة الشجرة
const TreeIcon = ({ stage, className }: { stage: string; className?: string }) => {
  const iconProps = { className: `w-16 h-16 ${className || ""}` };
  switch (stage) {
    case "بذرة": return <Sprout {...iconProps} className={`${iconProps.className} text-amber-600 dark:text-amber-400`} />;
    case "ورقة": return <Leaf {...iconProps} className="text-athar-secondary-500" />;
    case "غصن": return <Sprout {...iconProps} className="text-athar-secondary-600" />;
    case "شجرة صغيرة": return <Trees {...iconProps} className="text-athar-secondary-600" />;
    case "شجرة كبيرة": return <TreePine {...iconProps} className="text-athar-secondary-700" />;
    case "شجرة مثمرة": return <Flower2 {...iconProps} className="text-athar-accent-500" />;
    case "شجرة عملاقة": return <TreePine {...iconProps} className="text-gold-500 drop-shadow-gold" />;
    default: return <Sprout {...iconProps} className="text-athar-secondary-400" />;
  }
};

export default function TreeCard({ userName }: TreeCardProps) {
  const [challenge, setChallenge] = useState<DhikrChallenge | null>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [glowEffect, setGlowEffect] = useState(false);
  const [pointsToNext, setPointsToNext] = useState(0);

  // تحميل البيانات والإعدادات
  useEffect(() => {
    const saved = localStorage.getItem("athar-tree-completed");
    const count = saved ? parseInt(saved) : 0;
    setCompletedCount(count);
    loadNewChallenge();
    
    // تحديث المكتبة بشكل دوري (مرة عند التحميل)
    refreshLibrary();
  }, []);

  // الاستماع للأحداث من بقية التطبيق (صلاة، ختمة، إلخ)
  useEffect(() => {
    const handleExternalEvent = () => {
      const saved = localStorage.getItem("athar-tree-completed");
      const newCount = saved ? parseInt(saved) : 0;
      setCompletedCount(newCount);
      setGlowEffect(true);
      setTimeout(() => setGlowEffect(false), 1500);
    };

    window.addEventListener("athar-tree-update", handleExternalEvent);
    return () => window.removeEventListener("athar-tree-update", handleExternalEvent);
  }, []);

  const loadNewChallenge = () => {
    const completedIds = JSON.parse(localStorage.getItem("athar-tree-completed-ids") || "[]");
    const newChallenge = getRandomChallenge(completedIds);
    setChallenge(newChallenge);
  };

  const handleComplete = () => {
    if (!challenge) return;

    const newCount = completedCount + 1;
    setCompletedCount(newCount);
    localStorage.setItem("athar-tree-completed", newCount.toString());

    const completedIds = JSON.parse(localStorage.getItem("athar-tree-completed-ids") || "[]");
    completedIds.push(challenge.id);
    localStorage.setItem("athar-tree-completed-ids", JSON.stringify(completedIds));

    // إشعار التطبيق بالتحديث
    window.dispatchEvent(new Event("athar-tree-update"));

    setAnimating(true);
    setGlowEffect(true);
    setTimeout(() => setAnimating(false), 1000);
    setTimeout(() => setGlowEffect(false), 1500);

    setTimeout(() => {
      setShowPopup(false);
      loadNewChallenge();
    }, 2000);
  };

  const treeStage = getTreeStage(completedCount);
  const nameGreeting = userName ? `يا ${userName}` : "يا صاحب الأثر";

  // حساب النقاط المتبقية للمرحلة التالية
  useEffect(() => {
    const nextStagePoints = (() => {
      if (completedCount < 5) return 5;
      if (completedCount < 15) return 15;
      if (completedCount < 30) return 30;
      if (completedCount < 50) return 50;
      if (completedCount < 75) return 75;
      if (completedCount < 100) return 100;
      return 150;
    })();
    setPointsToNext(Math.max(0, nextStagePoints - completedCount));
  }, [completedCount]);

  return (
    <>
      <section className="px-5 py-2">
        <div className={`relative overflow-hidden bg-white dark:bg-gray-800 rounded-3xl shadow-md border border-athar-bg-200 dark:border-gray-700 p-5 space-y-5 transition-all duration-500 ${glowEffect ? "shadow-[0_0_20px_rgba(45,106,79,0.5)]" : ""}`}>
          
          {/* شريط علوي متحرك يتغير لونه حسب المرحلة */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-${treeStage.stage === "شجرة عملاقة" ? "gold" : "athar-accent"}-400 to-transparent opacity-80`}></div>

          {/* تأثير النبض عند إكمال التحدي */}
          {animating && (
            <div className="absolute inset-0 bg-athar-secondary-400/20 animate-pulse pointer-events-none rounded-3xl" />
          )}

          <div className="relative z-10 space-y-4">
            {/* رأس البطاقة */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-athar-accent-100 dark:bg-athar-accent-900/30">
                  <TreePine className="w-5 h-5 text-athar-accent-600 dark:text-athar-accent-400" />
                </div>
                <div>
                  <span className="font-bold text-athar-text dark:text-gray-200 text-base">
                    شجرة أثرك {nameGreeting}
                  </span>
                  <p className="text-xs text-athar-text-muted dark:text-gray-400 mt-0.5">
                    {completedCount === 0
                      ? "بذرة صغيرة تنتظر أن تنمو"
                      : `مرحلتك: ${treeStage.stage}`}
                  </p>
                </div>
              </div>
              {treeStage.stage !== "بذرة" && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-athar-secondary-50 dark:bg-athar-secondary-900/30">
                  <Trophy className="w-4 h-4 text-athar-secondary-600" />
                  <span className="text-xs font-semibold text-athar-secondary-700 dark:text-athar-secondary-400">
                    {treeStage.stage}
                  </span>
                </div>
              )}
            </div>

            {/* الشجرة المرئية مع أيقونة SVG متحركة */}
            <div className="flex flex-col items-center justify-center py-3">
              <div className="transition-transform duration-300 hover:scale-105">
                <TreeIcon stage={treeStage.stage} />
              </div>
              <div className="flex gap-1 justify-center flex-wrap mt-3">
                {Array.from({ length: Math.min(treeStage.leaves, 15) }).map((_, i) => (
                  <Leaf key={i} className="w-4 h-4 text-athar-secondary-500 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
              <p className="text-xs text-athar-text-muted dark:text-gray-400 mt-3">
                {treeStage.leaves} ورقة • {treeStage.branches} غصن • {treeStage.flowers} زهرة • {treeStage.fruits} ثمرة
              </p>
              <div className="mt-2 flex items-center gap-1 text-xs">
                <Zap className="w-3 h-3 text-athar-accent-500" />
                <span className="text-athar-accent-500 font-medium">{pointsToNext} نقطة للمرحلة التالية</span>
              </div>
            </div>

            {/* زر التحدي اليومي (محسّن للجوال) */}
            {challenge && (
              <button
                onClick={() => setShowPopup(true)}
                className="w-full p-5 rounded-2xl bg-athar-accent-500 text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] touch-manipulation text-right flex justify-between items-center group"
                style={{ touchAction: "manipulation" }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-5 h-5 text-white" />
                    <span className="text-sm font-semibold text-white">
                      {challenge.title}
                    </span>
                  </div>
                  <p className="text-xs text-white/80">
                    {challenge.virtue}
                  </p>
                  <p className="text-xs text-white/60 mt-1">— {challenge.source}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            {/* نص تحفيزي سفلي ديناميكي */}
            <div className="text-center">
              {completedCount === 0 && (
                <p className="text-xs text-athar-text-muted">🌱 ابدأ أول أثر اليوم لتنمو شجرتك</p>
              )}
              {completedCount > 0 && completedCount < 5 && (
                <p className="text-xs text-athar-secondary-500">🌱 استمر في الأذكار لتنمو شجرتك</p>
              )}
              {completedCount >= 5 && completedCount < 15 && (
                <p className="text-xs text-athar-secondary-500">🍃 شجرتك تنمو! أنت على بعد {pointsToNext} نقاط للمرحلة التالية</p>
              )}
              {completedCount >= 15 && completedCount < 30 && (
                <p className="text-xs text-athar-accent-500">🌳 ممتاز! استمر على هذا النحو</p>
              )}
              {completedCount >= 30 && (
                <p className="text-xs text-gold-500">🏆 أسطورة! شجرتك من أقوى الأشجار 🌟</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {challenge && (
        <DhikrPopup
          isOpen={showPopup}
          onClose={() => setShowPopup(false)}
          onComplete={handleComplete}
          phrases={challenge.phrases}
          target={challenge.target}
        />
      )}
    </>
  );
}
