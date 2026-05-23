"use client";

import { useState, useEffect, useCallback } from "react";
import { Flame, Gift, CheckCircle, Star, Sparkles } from "lucide-react";
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
    icon: <Sparkles className="w-5 h-5" />,
    color: "text-athar-accent",
    description: "90 يوماً وأنت تنشر النور",
  },
];

// رسائل تشجيعية يومية متنوعة
const dailyMessages = [
  "أنت تنير الدنيا",
  "بصمتك تترك أثراً",
  "استمر فأنت على خير",
  "كل يوم أنت أقرب",
  "نورك يزداد اليوم",
  "ما أجمل ثباتك",
  "أنت صاحب الأثر",
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
  const [dailyMessage, setDailyMessage] = useState("");

  // معرفة ما إذا كان اليوم قد ثُبّت
  useEffect(() => {
    const today = new Date().toDateString();
    const lastCheck = localStorage.getItem("athar-last-check");
    if (lastCheck === today) {
      setCheckedToday(true);
    }
    // اختر رسالة عشوائية لليوم
    const msgIndex = new Date().getDate() % dailyMessages.length;
    setDailyMessage(dailyMessages[msgIndex]);
  }, []);

  // المعلَم الحالي والتالي
  const currentMilestone = milestones.findLast((m) => streak >= m.days) || null;
  const nextMilestone = milestones.find((m) => streak < m.days);

  // حساب نسبة التقدم للمرحلة التالية (من 0 إلى 1)
  const progressRatio = nextMilestone
    ? (streak % (nextMilestone.days - (currentMilestone?.days || 0))) /
      (nextMilestone.days - (currentMilestone?.days || 0))
    : 1;

  // تثبيت البصمة اليومية
  const handleDailyCheck = useCallback(() => {
    if (checkedToday) return;

    const today = new Date().toDateString();
    const lastCheck = localStorage.getItem("athar-last-check");
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    let newStreak = streak;
    if (lastCheck === yesterday) {
      newStreak = streak + 1;
    } else if (lastCheck !== today) {
      newStreak = 1;
    }

    localStorage.setItem("athar-last-check", today);
    localStorage.setItem("athar-streak", newStreak.toString());
    setCheckedToday(true);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 1000);

    if (onStreakUpdate) onStreakUpdate(newStreak);

    const reachedMilestone = milestones.find((m) => newStreak === m.days);
    if (reachedMilestone) {
      setShowMilestoneModal(reachedMilestone);
      setShowGift(true);
    }
  }, [checkedToday, streak, onStreakUpdate]);

  return (
    <>
      <section className="px-4 py-4">
        <div className="relative overflow-hidden backdrop-blur-sm bg-white/70 dark:bg-gray-800/60 rounded-3xl shadow-2xl border border-white/50 dark:border-gray-700/50 p-6 space-y-5 transition-all duration-500 hover:shadow-athar-accent/5">
          {/* تاج علوي مع لون متغير حسب التقدم */}
          <div
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-athar-accent to-transparent opacity-70 transition-all duration-500"
            style={{ opacity: 0.4 + progressRatio * 0.6 }}
          ></div>

          {/* تأثير النبض عند التثبيت */}
          {animating && (
            <div className="absolute inset-0 bg-athar-accent/10 animate-pulse pointer-events-none"></div>
          )}

          <div className="relative z-10 space-y-4">
            {/* الهيدر مع رسالة اليوم */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={clsx(
                    "p-2 rounded-full transition-all duration-500",
                    streak > 0
                      ? "bg-athar-accent/20 shadow-lg shadow-athar-accent/20"
                      : "bg-gray-100 dark:bg-gray-700"
                  )}
                >
                  <Flame
                    className={clsx(
                      "w-5 h-5 transition-all duration-500",
                      streak > 0
                        ? "text-athar-accent animate-pulse"
                        : "text-gray-400 dark:text-gray-500"
                    )}
                  />
                </div>
                <div>
                  <span className="font-bold text-athar-text dark:text-gray-200">
                    {streak > 0 ? `بصمة أثر — ${streak} يوم` : "بصمة أثر"}
                  </span>
                  {streak > 0 && dailyMessage && (
                    <p className="text-xs text-athar-muted dark:text-gray-400 mt-0.5">
                      {dailyMessage}
                    </p>
                  )}
                </div>
              </div>
              {currentMilestone && (
                <div
                  className={clsx(
                    "text-sm font-medium flex items-center gap-1 px-2 py-1 rounded-full",
                    "bg-gradient-to-r from-transparent to-athar-accent/10"
                  )}
                >
                  {currentMilestone.icon}
                  <span className={currentMilestone.color}>{currentMilestone.label}</span>
                </div>
              )}
            </div>

            {/* نقاط التقدم (7 أيام) مع تأثير متوهج */}
            <div className="relative">
              <ProgressDots total={7} filled={streak % 7 || 7} className="mb-1" />
              {streak % 7 === 0 && streak > 0 && (
                <div className="absolute -top-1 left-0 right-0 flex justify-center">
                  <Sparkles className="w-4 h-4 text-yellow-400 animate-ping" />
                </div>
              )}
            </div>

            {/* رسالة المعلَم التالي بتصميم شريط تقدم */}
            {nextMilestone && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-athar-muted dark:text-gray-400">
                  <span>{currentMilestone?.label || "البداية"}</span>
                  <span className={nextMilestone.color}>{nextMilestone.label}</span>
                </div>
                <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-athar-primary via-athar-accent to-athar-primary rounded-full transition-all duration-500"
                    style={{ width: `${progressRatio * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-athar-muted dark:text-gray-400 text-center mt-1">
                  {nextMilestone.days - streak} أيام متبقية
                </p>
              </div>
            )}

            {/* زر التثبيت اليومي */}
            <button
              onClick={handleDailyCheck}
              disabled={checkedToday}
              className={clsx(
                "w-full py-3.5 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2",
                checkedToday
                  ? "bg-athar-bg dark:bg-gray-700 text-athar-muted dark:text-gray-400 cursor-default"
                  : "bg-athar-primary text-white hover:bg-athar-secondary active:scale-95 shadow-lg shadow-athar-primary/20 dark:shadow-athar-primary/10 hover:shadow-xl",
                animating && "scale-105"
              )}
            >
              {checkedToday ? (
                <>
                  <CheckCircle className="w-5 h-5 text-athar-primary dark:text-athar-accent" />
                  <span>بصمتك اليوم مضيئة</span>
                </>
              ) : (
                <>
                  <Star className="w-5 h-5" />
                  <span>أثّر فيني</span>
                </>
              )}
            </button>

            {/* رسالة الهدية عند الإكمال */}
            {showGift && currentMilestone && (
              <div className="p-3 bg-athar-accent/10 dark:bg-athar-accent/20 rounded-xl flex items-center gap-3 animate-fade-in">
                <Gift className="w-5 h-5 text-athar-accent" />
                <div>
                  <p className="text-sm font-medium text-athar-text dark:text-gray-200">
                    🎁 أثر مُهدى إليك
                  </p>
                  <p className="text-xs text-athar-muted dark:text-gray-400">
                    لأنك وصلت لمرحلة {currentMilestone.label}
                  </p>
                </div>
              </div>
            )}

            {/* تحذير الانقطاع بنمط أخف */}
            {streak > 0 && !checkedToday && (
              <p className="text-xs text-orange-500/80 text-center animate-pulse">
                ⚠️ بادر بتثبيت يومك قبل منتصف الليل
              </p>
            )}
          </div>
        </div>
      </section>

      {/* مودال المعلَم */}
      {showMilestoneModal && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl animate-scale-up">
            <div className="text-4xl">{showMilestoneModal.icon}</div>
            <h3 className="text-xl font-bold text-athar-text dark:text-gray-200">
              {showMilestoneModal.label}
            </h3>
            <p className="text-sm text-athar-muted dark:text-gray-400">
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
