"use client";

import { useState, useEffect } from "react";
import { Flame, Gift } from "lucide-react";
import ProgressDots from "./ProgressDots";

export default function Streak({ streak }: { streak: number }) {
  const [showGift, setShowGift] = useState(false);

  useEffect(() => {
    if (streak > 0 && streak % 7 === 0) {
      setShowGift(true);
    }
  }, [streak]);

  const milestones = [
    { days: 7, label: "⭐ نجم أول", color: "text-yellow-500" },
    { days: 30, label: "🌙 قمر مكتمل", color: "text-blue-400" },
    { days: 90, label: "☀️ شمس نور", color: "text-orange-500" },
    { days: 365, label: "🕊️ حامل الأثر", color: "text-athar-primary" },
  ];

  const currentMilestone = milestones.find((m) => streak >= m.days) || null;
  const nextMilestone = milestones.find((m) => streak < m.days);

  return (
    <section className="px-4 py-4">
      <div className="athar-card">
        {/* Streak Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame className={`w-5 h-5 ${streak > 0 ? "text-orange-500" : "text-gray-300"}`} />
            <span className="font-bold text-athar-text">
              {streak > 0 ? `${streak} يوم متتالي` : "ابدأ سلسلة النور"}
            </span>
          </div>
          {currentMilestone && (
            <span className={`text-sm ${currentMilestone.color}`}>
              {currentMilestone.label}
            </span>
          )}
        </div>

        {/* Progress Dots */}
        <ProgressDots total={7} filled={streak % 7 || 7} className="mb-3" />

        {/* Next Milestone */}
        {nextMilestone && (
          <p className="text-xs text-athar-muted mb-3">
            {nextMilestone.days - streak} أيام لـ {nextMilestone.label}
          </p>
        )}

        {/* Gift Notification */}
        {showGift && (
          <div className="p-3 bg-athar-accent/20 rounded-xl flex items-center gap-3">
            <Gift className="w-5 h-5 text-athar-accent" />
            <div>
              <p className="text-sm font-medium text-athar-text">🎁 هدية اليوم</p>
              <p className="text-xs text-athar-muted">لأنك {streak} أيام متتالية</p>
            </div>
          </div>
        )}

        {/* Warning */}
        {streak > 0 && (
          <p className="text-xs text-orange-500 mt-2 text-center">
            ⚠️ لا تفوت اليوم! سلسلتك في خطر
          </p>
        )}
      </div>
    </section>
  );
}
