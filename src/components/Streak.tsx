"use client";

import { useState, useEffect, useCallback } from "react";
import { Flame, Gift, CheckCircle, Star, Sparkles, BellRing, Bell, Loader2 } from "lucide-react";
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
  
  const [notificationStatus, setNotificationStatus] = useState<"granted" | "denied" | "unsupported" | null>(null);
  const [isEnablingNotifications, setIsEnablingNotifications] = useState(false);

  useEffect(() => {
    const today = new Date().toDateString();
    const lastCheck = localStorage.getItem("athar-last-check");
    if (lastCheck === today) {
      setCheckedToday(true);
    }
    const msgIndex = new Date().getDate() % dailyMessages.length;
    setDailyMessage(dailyMessages[msgIndex]);

    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        setNotificationStatus("granted");
      } else if (Notification.permission === "denied") {
        setNotificationStatus("denied");
      }
    } else {
      setNotificationStatus("unsupported");
    }
  }, []);

  const currentMilestone = milestones.findLast((m) => streak >= m.days) || null;
  const nextMilestone = milestones.find((m) => streak < m.days);

  const progressRatio = nextMilestone
    ? (streak % (nextMilestone.days - (currentMilestone?.days || 0))) /
      (nextMilestone.days - (currentMilestone?.days || 0))
    : 1;

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

  const handleEnableNotifications = async () => {
    if (!("Notification" in window)) {
      alert("متصفحك لا يدعم الإشعارات");
      return;
    }

    setIsEnablingNotifications(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotificationStatus("granted");
        new Notification("أثر", {
          body: "تم تفعيل الإشعارات بنجاح. سنذكرك بالصلاة وبصمتك اليومية.",
          icon: "/icons/icon-192x192.png",
        });
      } else {
        setNotificationStatus("denied");
      }
    } catch (e) {
      console.error("فشل تفعيل الإشعارات:", e);
    }
    setIsEnablingNotifications(false);
  };

  return (
    <>
      <section className="px-4 py-4">
        <div className="relative overflow-hidden bg-gradient-to-b from-athar-accent/5 to-athar-primary/5 dark:from-athar-accent/10 dark:to-athar-primary/10 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 dark:border-gray-700/50 p-6 space-y-5 transition-all duration-500">
          <div
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-athar-accent to-transparent opacity-70 transition-all duration-500"
            style={{ opacity: 0.4 + progressRatio * 0.6 }}
          ></div>

          {animating && (
            <div className="absolute inset-0 bg-athar-accent/10 animate-pulse pointer-events-none"></div>
          )}

          <div className="relative z-10 space-y-4">
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
                    <p className="text-xs text-athar-muted dark:text-gray-300 mt-0.5">
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

            <div className="relative">
              <ProgressDots total={7} filled={streak % 7 || 7} className="mb-1" />
              {streak % 7 === 0 && streak > 0 && (
                <div className="absolute -top-1 left-0 right-0 flex justify-center">
                  <Sparkles className="w-4 h-4 text-yellow-400 animate-ping" />
                </div>
              )}
            </div>

            {notificationStatus !== "granted" && notificationStatus !== "unsupported" && (
              <div className="p-4 bg-athar-accent/5 dark:bg-athar-accent/10 rounded-2xl space-y-3 border border-athar-accent/10">
                <div className="flex items-center gap-2">
                  <BellRing className="w-5 h-5 text-athar-accent" />
                  <span className="text-sm font-medium text-athar-text dark:text-gray-200">
                    تفعيل الإشعارات
                  </span>
                </div>
                <p className="text-xs text-athar-muted dark:text-gray-400">
                  نبهك للصلاة القادمة، ونذكرك بتثبيت بصمتك اليومية
                </p>
                <button
                  onClick={handleEnableNotifications}
                  disabled={isEnablingNotifications}
                  className="w-full py-2.5 rounded-xl bg-athar-accent text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-athar-accent/90 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isEnablingNotifications ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جارٍ التفعيل...
                    </>
                  ) : (
                    <>
                      <Bell className="w-4 h-4" />
                      فعّل الإشعارات
                    </>
                  )}
                </button>
              </div>
            )}

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

            {streak > 0 && !checkedToday && (
              <p className="text-xs text-orange-500/80 text-center animate-pulse">
                ⚠️ بادر بتثبيت يومك قبل منتصف الليل
              </p>
            )}
          </div>
        </div>
      </section>

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
