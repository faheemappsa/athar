"use client";

import { useState, useEffect, useCallback } from "react";
import { Moon, Sun, Heart, MessageCircle, X } from "lucide-react";
import { WHATSAPP_LINK } from "@/lib/constants";
import { trackSupportClick, trackAtharView } from "@/lib/analytics";
import AtharCard from "@/components/AtharCard";
import PrayerTimes from "@/components/PrayerTimes";
import Streak from "@/components/Streak";
import BottomNav from "@/components/BottomNav";

export default function Home() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [streak, setStreak] = useState(0);
  const [showDuaModal, setShowDuaModal] = useState(false);
  const [duaSent, setDuaSent] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // تحميل التفضيل الليلي من localStorage
  useEffect(() => {
    const savedDark = localStorage.getItem("athar-dark-mode") === "true";
    setIsDark(savedDark);
    if (savedDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // تطبيق الصنف dark على الـ html
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("athar-dark-mode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("athar-dark-mode", "false");
    }
  }, [isDark]);

  // تحديث الوقت الحالي كل ثانية
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // تحميل الـ streak من localStorage عند أول تحميل
  useEffect(() => {
    const saved = localStorage.getItem("athar-streak");
    if (saved) setStreak(parseInt(saved));
    trackAtharView("daily", "home");
  }, []);

  // تسجيل Service Worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered:", registration.scope);
        })
        .catch((error) => {
          console.log("SW registration failed:", error);
        });
    }
  }, []);

  const handleSupportClick = () => {
    trackSupportClick();
    window.open(WHATSAPP_LINK, "_blank");
  };

  // تحديث الـ streak عند تثبيت اليوم
  const handleStreakUpdate = useCallback((newStreak: number) => {
    setStreak(newStreak);
  }, []);

  const handleHeartClick = () => {
    setShowDuaModal(true);
    setDuaSent(false);
  };

  const handleAmeen = () => {
    setDuaSent(true);
    setTimeout(() => setShowDuaModal(false), 1500);
  };

  const toggleDarkMode = () => {
    setIsDark((prev) => !prev);
  };

  // التوقيت الحالي لشريط الدعاء (صباح / مساء)
  const hour = currentTime.getHours();
  const isMorning = hour >= 5 && hour < 12;
  const isEvening = hour >= 17 || hour < 5;

  return (
    <main className="min-h-screen pb-28">
      {/* Header */}
      <header className="flex items-center justify-between p-4">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-sm transition-all hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-athar-accent" />
          ) : (
            <Moon className="w-5 h-5 text-athar-primary" />
          )}
        </button>
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-athar-primary dark:text-athar-accent">أثر</h1>
          <p className="text-xs text-athar-muted dark:text-gray-400">أثرٌ جارٍ لا ينقطع</p>
        </div>
        <button
          onClick={handleHeartClick}
          className="p-2 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-sm transition-all hover:bg-rose-50 dark:hover:bg-rose-900/30 active:scale-95"
        >
          <Heart className="w-5 h-5 text-athar-primary dark:text-athar-accent" />
        </button>
      </header>

      {/* Dua Strip - ديناميكي حسب الوقت */}
      <section className="px-4 py-2">
        <div className="bg-athar-primary/5 dark:bg-gray-800/50 rounded-2xl px-4 py-3 text-center">
          {isMorning && (
            <p className="text-sm font-medium text-athar-text dark:text-gray-200">
              اللهم بك أصبحنا وبك أمسينا وبك نحيا وبك نموت وإليك النشور
            </p>
          )}
          {isEvening && (
            <p className="text-sm font-medium text-athar-text dark:text-gray-200">
              اللهم بك أمسينا وبك أصبحنا وبك نحيا وبك نموت وإليك المصير
            </p>
          )}
          {!isMorning && !isEvening && (
            <p className="text-sm font-medium text-athar-text dark:text-gray-200">
              اللهم لا تُخْلِفْ لنا وعدك
            </p>
          )}
          <p className="text-xs text-athar-muted dark:text-gray-400 mt-0.5">
            {isMorning ? "اللهم اجعل صباحنا نوراً" : isEvening ? "اللهم اجعل مساءنا سكينة" : "اللهم ارزقنا البركة في وقتنا"}
          </p>
        </div>
      </section>

      {/* Athar Card */}
      <AtharCard />

      {/* Prayer Times */}
      <PrayerTimes />

      {/* بصمة أثر */}
      <Streak streak={streak} onStreakUpdate={handleStreakUpdate} />

      {/* Waqf Card */}
      <section className="px-4 py-4">
        <div className="bg-athar-bg/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 text-center border border-athar-primary/10 dark:border-gray-700">
          <p className="text-xs text-athar-muted dark:text-gray-400 leading-relaxed">
            هذا الأثر الجاري صدقة عن{" "}
            <span className="text-athar-primary dark:text-athar-accent font-medium">مسلم عوده البويني</span>{" "}
            رحمه الله
          </p>
          <button
            onClick={handleSupportClick}
            className="mt-2 text-sm text-athar-primary dark:text-athar-accent font-medium flex items-center justify-center gap-1 mx-auto hover:underline"
          >
            <MessageCircle className="w-4 h-4" />
            تواصل معنا
          </button>
        </div>
      </section>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* مودال الدعاء للوقف والمسلمين */}
      {showDuaModal && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-sm w-full text-center space-y-5 shadow-2xl animate-scale-up relative">
            {/* زر الإغلاق */}
            <button
              onClick={() => setShowDuaModal(false)}
              className="absolute top-4 left-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            <Heart className="w-10 h-10 text-athar-accent mx-auto" />
            
            <h3 className="text-lg font-bold text-athar-text dark:text-gray-200">الدعاء للوقف</h3>
            
            <div className="bg-athar-bg dark:bg-gray-800 rounded-2xl p-4 text-sm leading-relaxed text-athar-text dark:text-gray-300">
              اللهم اغفر لمسلم عوده البويني وارحمه، واغفر لموتى المسلمين أجمعين، واجعل هذا الأثر جارياً لهم إلى يوم الدين، واجعل أعمالهم نوراً في قبورهم، واجمعنا بهم في جنات النعيم.
            </div>

            {!duaSent ? (
              <button
                onClick={handleAmeen}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <span>آمين</span>
                <span className="text-lg">🤲</span>
              </button>
            ) : (
              <div className="bg-athar-primary/10 dark:bg-athar-primary/20 text-athar-primary dark:text-athar-accent rounded-xl py-3 px-4 text-sm font-medium">
                آمين 🤲 جزاك الله خيراً
              </div>
            )}

            <p className="text-xs text-athar-muted dark:text-gray-500">
              شارك في الأجر بنشر التطبيق أو الدعاء
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
