"use client";

import { useState, useEffect, useCallback } from "react";
import { Flame, Gift, CheckCircle, Star, Moon, Sun, Trophy } from "lucide-react";
import { clsx } from "clsx";
import ProgressDots from "./ProgressDots";

interface Milestone {
  days: number;
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const milestones: Milestone[] = [
  {
    days: 7,
    label: "صاحب أثر",
    icon: <Star className="w-5 h-5" />,
    color: "text-yellow-500",
    description: "أول 7 أيام في رحلتك",
  },
  {
    days: 30,
    label: "حامل نور",
    icon: <Flame className="w-5 h-5" />,
    color: "text-orange-500",
    description: "30 يوماً من البصمات",
  },
  {
    days: 90,
    label: "سفير الأثر",
    icon: <Sun className="w-5 h-5" />,
    color: "text-athar-accent",
    description: "90 يوماً وأنت تنشر النور",
  },
  {
    days: 365,
    label: "أثر جارٍ",
    icon: <Trophy className="w-5 h-5" />,
    color: "text-athar-primary",
    description: "عام كامل من البصمات",
  },
];

interface StreakProps {
  streak: number;
  onStreakUpdate?: (newStreak: number) => void;
}

export default function Streak({ streak, onStreakUpdate }: StreakProps) {
  const [checkedToday, setCheckedToday] = useState(false);
  const [showGift, setShowGift] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState<Milestone | null>(null);

  // معرفة ما إذا كان اليوم قد ثُبّت
  useEffect(() => {
    const today = new Date().toDateString();
    const lastCheck = localStorage.getItem("athar-last-check");
    if (lastCheck === today) {
      setCheckedToday(true);
    }
  }, []);

  // المعلَم الحالي والتالي
  const currentMilestone = milestones.findLast((m) => streak >= m.days) || null;
  const nextMilestone = milestones.find((m) => streak < m.days);

  // تثبيت البصمة اليومية
  const handleDailyCheck = useCallback(() => {
    if (checkedToday) return;

    const today = new Date().toDateString();
    const lastCheck = localStorage.getItem("athar-last-check");
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    let newStreak = streak;
    if (lastCheck === yesterday) {
      // متصل
      newStreak = streak + 1;
    } else if (lastCheck !== today) {
      // منقطع
      newStreak = 1;
    }

    localStorage.setItem("athar-last-check", today);
    localStorage.setItem("athar-streak", newStreak.toString());
    setCheckedToday(true);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 600);

    if (onStreakUpdate) onStreakUpdate(newStreak);

    // إظهار هدية عند المعلَم
    const reachedMilestone = milestones.find((m) => newStreak === m.days);
    if (reachedMilestone) {
      setShowMilestoneModal(reachedMilestone);
      setShowGift(true);
    }
  }, [checkedToday, streak, onStreakUpdate]);

  return (
    <>
      <section className="px-4 py-4">
        <div className="athar-card relative overflow-hidden">
          {/* خلفية ناعمة متدرجة */}
          <div className="absolute inset-0 bg-gradient-to-b from-athar-accent/5 to-white pointer-events-none" />

          <div className="relative z-10 space-y-4">
            {/* الهيدر */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={clsx(
                    "p-2 rounded-full transition-all duration-300",
                    streak > 0 ? "bg-athar-accent/20" : "bg-gray-100"
                  )}
                >
                  <Flame
                    className={clsx(
                      "w-5 h-5 transition-colors",
                      streak > 0 ? "text-athar-accent" : "text-gray-400"
                    )}
                  />
                </div>
                <span className="font-bold text-athar-text">
                  {streak > 0 ? `بصمة أثر — ${streak} يوم` : "بصمة أثر"}
                </span>
              </div>
              {currentMilestone && (
                <span className={clsx("text-sm font-medium", currentMilestone.color)}>
                  {currentMilestone.icon}
                  <span className="mr-1">{currentMilestone.label}</span>
                </span>
              )}
            </div>

            {/* نقاط التقدم (7 أيام) */}
            <ProgressDots total={7} filled={streak % 7 || 7} className="mb-1" />

            {/* رسالة المعلَم التالي */}
            {nextMilestone && (
              <p className="text-xs text-athar-muted text-center">
                {nextMilestone.days - streak} أيام متبقية لتصبح{" "}
                <span className={nextMilestone.color}>{nextMilestone.label}</span>
              </p>
            )}

            {/* زر التثبيت اليومي */}
            <button
              onClick={handleDailyCheck}
              disabled={checkedToday}
              className={clsx(
                "w-full py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2",
                checkedToday
                  ? "bg-athar-bg text-athar-muted cursor-default"
                  : "bg-athar-primary text-white hover:bg-athar-secondary active:scale-95 shadow-md",
                animating && "animate-pulse"
              )}
            >
              {checkedToday ? (
                <>
                  <CheckCircle className="w-5 h-5 text-athar-primary" />
                  <span>بصمتك اليوم مضيئة</span>
                </>
              ) : (
                <>
                  <Star className="w-5 h-5" />
                  <span>أثّر فيني</span>
                </>
              )}
            </button>

            {/* رسالة الهدية عند مناسبة خاصة */}
            {showGift && currentMilestone && (
              <div className="p-3 bg-athar-accent/10 rounded-xl flex items-center gap-3 animate-fade-in">
                <Gift className="w-5 h-5 text-athar-accent" />
                <div>
                  <p className="text-sm font-medium text-athar-text">
                    🎁 أثر مُهدى إليك
                  </p>
                  <p className="text-xs text-athar-muted">
                    لأنك وصلت لمرحلة {currentMilestone.label}
                  </p>
                </div>
              </div>
            )}

            {/* تحذير الانقطاع */}
            {streak > 0 && !checkedToday && (
              <p className="text-xs text-orange-500 text-center animate-pulse">
                ⚠️ بادر بتثبيت يومك قبل منتصف الليل لئلا ينقطع الأثر
              </p>
            )}
          </div>
        </div>
      </section>

      {/* مودال المعلَم */}
      {showMilestoneModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl animate-scale-up">
            <div className="text-4xl">{showMilestoneModal.icon}</div>
            <h3 className="text-xl font-bold text-athar-text">
              {showMilestoneModal.label}
            </h3>
            <p className="text-sm text-athar-muted">
              {showMilestoneModal.description}
            </p>
            <p className="text-xs text-athar-accent font-medium">
              استمر فالأثر لا ينقطع
            </p>
            <button
              onClick={() => setShowMilestoneModal(null)}
              className="btn-primary w-full mt-2"
            >
              الحمد لله
            </button>
          </div>
        </div>
      )}
    </>
  );
}
