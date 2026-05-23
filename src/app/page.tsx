"use client";

import { useState, useEffect, useCallback } from "react";
import { Moon, Sun, Heart, MessageCircle, X, Sparkles, MessageCircleHeart } from "lucide-react";
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
  const [isCheckedToday, setIsCheckedToday] = useState(false);
  const [showFadfedInvite, setShowFadfedInvite] = useState(false); // الخطوة 2: بطاقة الدعوة لفضفض

  useEffect(() => {
    const savedDark = localStorage.getItem("athar-dark-mode") === "true";
    setIsDark(savedDark);
    if (savedDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("athar-dark-mode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("athar-dark-mode", "false");
    }
  }, [isDark]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("athar-streak");
    if (saved) setStreak(parseInt(saved));
    trackAtharView("daily", "home");
    const today = new Date().toDateString();
    const lastCheck = localStorage.getItem("athar-last-check");
    setIsCheckedToday(lastCheck === today);
  }, []);

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

  const handleStreakUpdate = useCallback((newStreak: number) => {
    setStreak(newStreak);
    setIsCheckedToday(true);
  }, []);

  const handleHeartClick = () => {
    setShowDuaModal(true);
    setDuaSent(false);
    setShowFadfedInvite(false);
  };

  const handleAmeen = () => {
    setDuaSent(true);
    // بعد "آمين" ننتقل لبطاقة دعوة "فضفض لأثر" بدلاً من إغلاق المودال
    setShowFadfedInvite(true);
  };

  const handleCloseModal = () => {
    setShowDuaModal(false);
    setShowFadfedInvite(false);
  };

  const toggleDarkMode = () => {
    setIsDark((prev) => !prev);
  };

  const hour = currentTime.getHours();
  let greetingText = "";
  let duaText = "";
  let subText = "";
  let greetingEmoji = "";

  if (hour >= 3 && hour < 6) {
    greetingText = "أسعد الله فجركم";
    duaText = "اللهم بك أصبحنا وبك أمسينا وبك نحيا وبك نموت وإليك النشور";
    subText = "وقت مبارك لصلاة الفجر";
    greetingEmoji = "🌙";
  } else if (hour >= 6 && hour < 12) {
    greetingText = "صباح النور يا صاحب الأثر";
    duaText = "اللهم اجعل صباحنا نوراً وقلوبنا مطمئنة";
    subText = "ابدأ يومك بذكر";
    greetingEmoji = "☀️";
  } else if (hour >= 12 && hour < 17) {
    greetingText = "حياك الله في هذه الظهيرة";
    duaText = "اللهم ارزقنا البركة في وقتنا وأعمالنا";
    subText = "لا تنس أذكار المساء";
    greetingEmoji = "🌤️";
  } else if (hour >= 17 && hour < 21) {
    greetingText = "مساء الخير يا صاحب الأثر";
    duaText = "اللهم بك أمسينا وبك أصبحنا وبك نحيا وبك نموت وإليك المصير";
    subText = "أمسِ بذكر الله";
    greetingEmoji = "🌆";
  } else {
    greetingText = "اللهم لا تخلف لنا وعدك";
    duaText = "اللهم أنزل السكينة في قلوبنا";
    subText = "ليلة هادئة بالنور";
    greetingEmoji = "🌙";
  }

  const reminderBanner = !isCheckedToday ? (
    <div className="mt-2 flex items-center justify-center gap-1 text-xs text-athar-accent animate-pulse">
      <Sparkles className="w-3 h-3" />
      <span>بادر بتثبيت بصمتك اليوم</span>
    </div>
  ) : null;

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

      {/* شريط ترحيبي ذكي */}
      <section className="px-4 py-2">
        <div className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/60 rounded-2xl px-5 py-4 text-center shadow-sm border border-white/50 dark:border-gray-700/50 transition-all duration-500">
          <div className="flex items-center justify-center gap-2 text-athar-text dark:text-gray-200">
            <span className="text-lg">{greetingEmoji}</span>
            <p className="text-sm font-medium">{greetingText}</p>
          </div>
          <p className="text-xs text-athar-muted dark:text-gray-400 mt-1.5 leading-relaxed">
            {duaText}
          </p>
          <p className="text-xs text-athar-muted/70 dark:text-gray-500 mt-0.5">
            {subText}
          </p>
          {reminderBanner}
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

      <BottomNav />

      {/* مودال القلب: رحلة الدعاء ← فضفض لأثر */}
      {showDuaModal && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-sm w-full text-center space-y-5 shadow-2xl animate-scale-up relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 left-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            {!showFadfedInvite ? (
              <>
                {/* الخطوة 1: الدعاء للوقف */}
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
              </>
            ) : (
              <>
                {/* الخطوة 2: بطاقة دعوة فضفض لأثر */}
                <MessageCircleHeart className="w-10 h-10 text-athar-accent mx-auto" />
                <h3 className="text-lg font-bold text-athar-text dark:text-gray-200">فضفض لأثر</h3>
                <p className="text-sm text-athar-text dark:text-gray-300 leading-relaxed">
                  هل تشعر بضيق، حزن، أو فرح؟ فضفض لأثر يسمعك، ويختار لك آية أو حديثاً أو قصة تلامس قلبك.
                </p>
                <button
                  onClick={() => {
                    handleCloseModal();
                    // هنا سيتم فتح مودال "فضفض لأثر" الحقيقي لاحقاً
                    alert("بوابة فضفض لأثر قادمة قريباً إن شاء الله");
                  }}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <MessageCircleHeart className="w-5 h-5" />
                  <span>ادخل فضفض لأثر</span>
                </button>
                <p className="text-xs text-athar-muted dark:text-gray-500">
                  مكانك الآمن للفضفضة والمواساة
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
