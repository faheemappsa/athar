"use client";

import { useState, useEffect } from "react";
import { Sparkles, TreePine, Leaf, Trophy } from "lucide-react";
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

  return (
    <>
      <section className="px-4 py-4">
        <div className="relative overflow-hidden bg-gradient-to-b from-athar-accent-100 to-athar-primary-50 dark:from-athar-accent-900/20 dark:to-athar-primary-900/20 rounded-3xl shadow-lg border border-athar-accent-200/30 dark:border-athar-accent-700/30 p-6 space-y-5 backdrop-blur-sm">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-athar-accent-400 to-transparent opacity-80"></div>

          {animating && (
            <div className="absolute inset-0 bg-athar-accent-400/10 animate-pulse pointer-events-none"></div>
          )}

          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-athar-accent-200/50">
                  <TreePine className="w-5 h-5 text-athar-accent-500" />
                </div>
                <div>
                  <span className="font-bold text-athar-text dark:text-gray-200">
                    شجرة أثرك {nameGreeting}
                  </span>
                  <p className="text-xs text-athar-text-muted dark:text-gray-400 mt-0.5">
                    {completedCount === 0
                      ? "بذرة صغيرة تنتظر أن تنمو"
                      : `شجرتك في مرحلة: ${treeStage.stage}`}
                  </p>
                </div>
              </div>
              {treeStage.stage !== "بذرة" && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-athar-accent-100/50">
                  <Trophy className="w-4 h-4 text-athar-accent-500" />
                  <span className="text-xs font-medium text-athar-accent-600">{treeStage.stage}</span>
                </div>
              )}
            </div>

            <div className="flex justify-center py-4">
              <div className="text-center space-y-2">
                <div className="text-6xl">
                  {treeStage.stage === "بذرة" && "🌰"}
                  {treeStage.stage === "ورقة" && "🍃"}
                  {treeStage.stage === "غصن" && "🌿"}
                  {treeStage.stage === "شجرة صغيرة" && "🪴"}
                  {treeStage.stage === "شجرة كبيرة" && "🌳"}
                  {treeStage.stage === "شجرة مثمرة" && "🌴"}
                  {treeStage.stage === "شجرة عملاقة" && "🌲"}
                </div>
                <div className="flex gap-1 justify-center flex-wrap">
                  {Array.from({ length: Math.min(treeStage.leaves, 20) }).map((_, i) => (
                    <Leaf key={i} className="w-4 h-4 text-athar-accent-400" />
                  ))}
                </div>
                <p className="text-xs text-athar-text-muted dark:text-gray-400">
                  {treeStage.leaves} ورقة • {treeStage.branches} غصن • {treeStage.flowers} زهرة • {treeStage.fruits} ثمرة
                </p>
                <p className="text-xs text-athar-accent-500 font-medium">
                  التالية: {treeStage.nextStage}
                </p>
              </div>
            </div>

            {challenge && (
              <button
                onClick={() => setShowPopup(true)}
                className="w-full p-4 rounded-2xl bg-white dark:bg-gray-800 border border-athar-accent-200/50 dark:border-athar-accent-700/50 hover:shadow-md transition-all active:scale-95 text-right"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-athar-accent-500" />
                  <span className="text-sm font-medium text-athar-text dark:text-gray-200">
                    {challenge.title}
                  </span>
                </div>
                <p className="text-xs text-athar-text-muted dark:text-gray-400">
                  {challenge.virtue}
                </p>
                <p className="text-xs text-athar-accent-400 mt-1">— {challenge.source}</p>
              </button>
            )}

            {completedCount > 0 && (
              <p className="text-xs text-athar-text-muted dark:text-gray-400 text-center">
                {completedCount < 5
                  ? "استمر في الأذكار لتنمو شجرتك 🌱"
                  : "شجرتك تنمو بسرعة! استمر على هذا النحو 🌳"}
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
