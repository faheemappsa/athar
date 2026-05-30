"use client";

import { useState, useEffect } from "react";
import { Sparkles, TreePine, Leaf, Trophy, ChevronRight } from "lucide-react";
import { getRandomChallenge, getTreeStage } from "@/lib/challenges";
import type { DhikrChallenge } from "@/lib/challenges";
import DhikrPopup from "./DhikrPopup";

interface TreeCardProps {
  userName?: string | null;
}

export default function TreeCard({ userName }: TreeCardProps) {
  const [challenge, setChallenge] = useState<DhikrChallenge | null>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("athar-tree-completed");
    const count = saved ? parseInt(saved) : 0;
    setCompletedCount(count);
    loadNewChallenge();
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

    setAnimating(true);
    setTimeout(() => setAnimating(false), 1000);

    setTimeout(() => {
      setShowPopup(false);
      loadNewChallenge();
    }, 2000);
  };

  const treeStage = getTreeStage(completedCount);
  const nameGreeting = userName ? `يا ${userName}` : "يا صاحب الأثر";

  // أيقونة المرحلة الحالية
  const stageIcon = () => {
    switch (treeStage.stage) {
      case "بذرة": return "🌰";
      case "ورقة": return "🍃";
      case "غصن": return "🌿";
      case "شجرة صغيرة": return "🪴";
      case "شجرة كبيرة": return "🌳";
      case "شجرة مثمرة": return "🌴";
      case "شجرة عملاقة": return "🌲";
      default: return "🌱";
    }
  };

  return (
    <>
      <section className="px-5 py-2">
        <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-3xl shadow-md border border-athar-bg-200 dark:border-gray-700 p-5 space-y-5 transition-all">
          
          {/* شريط علوي متحرك - لون أساسي (ذهبي) */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-athar-primary-500 to-transparent opacity-70"></div>

          {/* تأثير النبض عند إكمال التحدي */}
          {animating && (
            <div className="absolute inset-0 bg-athar-secondary-400/10 animate-pulse pointer-events-none rounded-3xl"></div>
          )}

          <div className="relative z-10 space-y-4">
            {/* رأس البطاقة */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-athar-primary-50 dark:bg-athar-primary-900/30">
                  <TreePine className="w-5 h-5 text-athar-primary-600 dark:text-athar-secondary-400" />
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

            {/* الشجرة المرئية مع أيقونات النمو */}
            <div className="flex flex-col items-center justify-center py-3">
              <div className="text-7xl drop-shadow-md transition-transform duration-300 hover:scale-105">
                {stageIcon()}
              </div>
              <div className="flex gap-1 justify-center flex-wrap mt-3">
                {Array.from({ length: Math.min(treeStage.leaves, 15) }).map((_, i) => (
                  <Leaf key={i} className="w-4 h-4 text-athar-secondary-500" />
                ))}
              </div>
              <p className="text-xs text-athar-text-muted dark:text-gray-400 mt-3">
                {treeStage.leaves} ورقة • {treeStage.branches} غصن • {treeStage.flowers} زهرة • {treeStage.fruits} ثمرة
              </p>
              <p className="text-xs text-athar-accent-500 font-medium mt-1">
                التالية: {treeStage.nextStage}
              </p>
            </div>

            {/* زر التحدي اليومي (محسّن للجوال) */}
            {challenge && (
              <button
                onClick={() => setShowPopup(true)}
                className="w-full p-4 rounded-2xl bg-athar-bg-100 dark:bg-gray-700/50 border border-athar-bg-200 dark:border-gray-600 hover:shadow-md transition-all active:scale-[0.98] touch-manipulation text-right flex justify-between items-center group"
                style={{ touchAction: "manipulation" }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-athar-primary-500" />
                    <span className="text-sm font-semibold text-athar-text dark:text-gray-200">
                      {challenge.title}
                    </span>
                  </div>
                  <p className="text-xs text-athar-text-muted dark:text-gray-400">
                    {challenge.virtue}
                  </p>
                  <p className="text-xs text-athar-accent-500 mt-1">— {challenge.source}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-athar-primary-400 group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            {/* نص تحفيزي سفلي */}
            {completedCount > 0 && (
              <p className="text-xs text-athar-text-muted dark:text-gray-400 text-center pt-1">
                {completedCount < 5
                  ? "🌱 استمر في الأذكار لتنمو شجرتك"
                  : "🌳 شجرتك تنمو بسرعة! استمر على هذا النحو"}
              </p>
            )}
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
