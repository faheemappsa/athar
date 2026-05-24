"use client";
import { useState, useEffect } from "react";
import { Moon, Sun, Heart, MessageCircle, X, Sparkles, MessageCircleHeart } from "lucide-react";
import { WHATSAPP_LINK } from "@/lib/constants";
import { trackSupportClick, trackAtharView } from "@/lib/analytics";
import AtharCard from "@/components/AtharCard";
import PrayerTimes from "@/components/PrayerTimes";
import TreeCard from "@/components/TreeCard";
import BottomNav from "@/components/BottomNav";
import Fadfed from "@/components/Fadfed";
import NameModal from "@/components/NameModal";

export default function Home() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showDuaModal, setShowDuaModal] = useState(false);
  const [duaSent, setDuaSent] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isCheckedToday, setIsCheckedToday] = useState(false);
  const [showFadfedInvite, setShowFadfedInvite] = useState(false);
  const [showFadfed, setShowFadfed] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  // ==================== الأذونات والإشعارات ====================
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
    trackAtharView("daily", "home");
    const today = new Date().toDateString();
    const lastCheck = localStorage.getItem("athar-last-check");
    setIsCheckedToday(lastCheck === today);
    const savedName = localStorage.getItem("athar-user-name");
    if (savedName) setUserName(savedName);
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

  // جدولة الإشعارات
  useEffect(() => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    let prayerTimer: NodeJS.Timeout;
    let reminderTimer: NodeJS.Timeout;

    const schedulePrayerNotification = async () => {
      try {
        const savedTimes = localStorage.getItem("athar-prayer-times");
        if (savedTimes) {
          const times = JSON.parse(savedTimes);
          const now = new Date();
          const currentMinutes = now.getHours() * 60 + now.getMinutes();
          
          let nextPrayer = null;
          for (const prayer of times) {
            const [h, m] = prayer.time.split(":").map(Number);
            const prayerMinutes = h * 60 + m;
            if (prayerMinutes > currentMinutes) {
              nextPrayer = prayer;
              break;
            }
          }

          if (nextPrayer) {
            const [h, m] = nextPrayer.time.split(":").map(Number);
            const prayerTime = new Date();
            prayerTime.setHours(h, m - 5, 0, 0);
            const delay = prayerTime.getTime() - Date.now();
            
            if (delay > 0) {
              prayerTimer = setTimeout(() => {
                new Notification("موعد الصلاة", {
                  body: `اقترب أذان ${nextPrayer.name} (${nextPrayer.time})`,
                  icon: "/icons/icon-192x192.png",
                  badge: "/icons/icon-192x192.png",
                  tag: "prayer-reminder",
                  requireInteraction: true,
                });
              }, delay);
            }
          }
        }
      } catch (e) {
        console.error("فشل جدولة إشعار الصلاة:", e);
      }
    };

    const scheduleReminderNotification = () => {
      if (isCheckedToday) return;
      const now = new Date();
      const reminderTime = new Date();
      reminderTime.setHours(21, 0, 0, 0);
      if (reminderTime.getTime() <= now.getTime()) {
        reminderTime.setDate(reminderTime.getDate() + 1);
      }
      const delay = reminderTime.getTime() - now.getTime();
      reminderTimer = setTimeout(() => {
        new Notification("تذكير بصمة أثر", {
          body: "لم تثبت بصمتك اليوم بعد. بادر قبل منتصف الليل.",
          icon: "/icons/icon-192x192.png",
          badge: "/icons/icon-192x192.png",
          tag: "streak-reminder",
          requireInteraction: true,
        });
      }, delay);
    };

    schedulePrayerNotification();
    scheduleReminderNotification();

    return () => {
      if (prayerTimer) clearTimeout(prayerTimer);
      if (reminderTimer) clearTimeout(reminderTimer);
    };
  }, [isCheckedToday]);

  // ==================== المعالجات ====================
  const handleSupportClick = () => {
    trackSupportClick();
    window.open(WHATSAPP_LINK, "_blank");
  };

  const handleHeartClick = () => {
    if (!userName) {
      setShowNameModal(true);
      return;
    }
    setShowDuaModal(true);
    setDuaSent(false);
    setShowFadfedInvite(false);
  };

  const handleNameSave = (name: string) => {
    setUserName(name);
    localStorage.setItem("athar-user-name", name);
    setShowNameModal(false);
    setShowDuaModal(true);
    setDuaSent(false);
    setShowFadfedInvite(false);
  };

  const handleAmeen = () => {
    setDuaSent(true);
    setShowFadfedInvite(true);
  };

  const handleCloseModal = () => {
    setShowDuaModal(false);
    setShowFadfedInvite(false);
  };

  const toggleDarkMode = () => {
    setIsDark((prev) => !prev);
  };

  // ==================== الترحيب ====================
  const hour = currentTime.getHours();
  let greetingText = "";
  let duaText = "";
  let subText = "";
  let greetingEmoji = "";

  const nameSuffix = userName ? ` يا ${userName}` : " يا صاحب الأثر";

  if (hour >= 3 && hour < 6) {
    greetingText = `أسعد الله فجرك${nameSuffix}`;
    duaText = "اللهم بك أصبحنا وبك أمسينا وبك نحيا وبك نموت وإليك النشور";
    subText = "وقت مبارك لصلاة الفجر";
    greetingEmoji = "🌙";
  } else if (hour >= 6 && hour < 12) {
    greetingText = `صباح النور${nameSuffix}`;
    duaText = "اللهم اجعل صباحنا نوراً وقلوبنا مطمئنة";
    subText = "ابدأ يومك بذكر";
    greetingEmoji = "☀️";
  } else if (hour >= 12 && hour < 17) {
    greetingText = `حياك الله${nameSuffix}`;
    duaText = "اللهم ارزقنا البركة في وقتنا وأعمالنا";
    subText = "لا تنس أذكار المساء";
    greetingEmoji = "🌤️";
  } else if (hour >= 17 && hour < 21) {
    greetingText = `مساء الخير${nameSuffix}`;
    duaText = "اللهم بك أمسينا وبك أصبحنا وبك نحيا وبك نموت وإليك المصير";
    subText = "أمسِ بذكر الله";
    greetingEmoji = "🌆";
  } else {
    greetingText = `اللهم لا تخلف لنا وعدك${nameSuffix}`;
    duaText = "اللهم أنزل السكينة في قلوبنا";
    subText = "ليلة هادئة بالنور";
    greetingEmoji = "🌙";
  }

  const reminderBanner = !isCheckedToday ? (
    <div className="mt-2 flex items-center justify-center gap-1 text-xs text-athar-accent-500 animate-pulse">
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
            <Sun className="w-5 h-5 text-athar-accent-400" />
          ) : (
            <Moon className="w-5 h-5 text-athar-primary-500" />
          )}
        </button>
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-athar-primary-600 dark:text-athar-accent-400">أثر</h1>
          <p className="text-xs text-athar-accent-500 font-medium mt-1">أثرٌ جارٍ لا ينقطع</p>
        </div>
        <button
          onClick={handleHeartClick}
          className="p-2 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-sm transition-all hover:bg-rose-50 dark:hover:bg-rose-900/30 active:scale-95"
        >
          <Heart className="w-5 h-5 text-athar-primary-500 dark:text-athar-accent-400" />
        </button>
      </header>

      {/* شريط ترحيبي ذكي */}
      <section className="px-4 py-2">
        <div className="backdrop-blur-sm bg-gradient-to-br from-athar-primary-200 via-athar-accent-200 to-athar-bg-100 dark:from-athar-primary-800 dark:via-athar-accent-800/30 dark:to-gray-800/60 rounded-2xl px-5 py-4 text-center shadow-sm border border-athar-primary-300/30 dark:border-gray-700/50 transition-all duration-500">
          <div className="flex items-center justify-center gap-2 text-athar-primary-700 dark:text-gray-200">
            <span className="text-lg">{greetingEmoji}</span>
            <p className="text-sm font-medium">{greetingText}</p>
          </div>
          <p className="text-xs text-athar-primary-500 dark:text-gray-300 mt-1.5 leading-relaxed">
            {duaText}
          </p>
          <p className="text-xs text-athar-primary-400 dark:text-gray-500 mt-0.5">
            {subText}
          </p>
          {reminderBanner}
        </div>
      </section>

      <AtharCard />
      <PrayerTimes />
      <TreeCard userName={userName} />

      {/* Waqf Card */}
      <section className="px-4 py-4">
        <div className="bg-athar-primary-200/50 dark:bg-athar-primary-800/30 backdrop-blur-sm rounded-2xl p-4 text-center border border-athar-primary-300/30 dark:border-gray-700">
          <p className="text-xs text-athar-primary-600 dark:text-gray-300 leading-relaxed">
            هذا الأثر الجاري صدقة عن{" "}
            <span className="text-athar-primary-700 dark:text-athar-accent-400 font-medium">مسلم عوده البويني</span>{" "}
            رحمه الله
          </p>
          <button
            onClick={handleSupportClick}
            className="mt-2 text-sm text-athar-accent-600 font-medium flex items-center justify-center gap-1 mx-auto hover:underline"
          >
            <MessageCircle className="w-4 h-4" />
            تواصل معنا
          </button>
        </div>
      </section>

      <BottomNav />

      <NameModal
        isOpen={showNameModal}
        onSave={handleNameSave}
        onClose={() => setShowNameModal(false)}
      />

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
                <Heart className="w-10 h-10 text-athar-accent-500 mx-auto" />
                <h3 className="text-lg font-bold text-athar-text dark:text-gray-200">الدعاء للوقف</h3>
                <div className="bg-athar-bg-100 dark:bg-gray-800 rounded-2xl p-4 text-sm leading-relaxed text-athar-text dark:text-gray-300">
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
                  <div className="bg-athar-primary-100 dark:bg-athar-primary-800/20 text-athar-primary-600 dark:text-athar-accent-400 rounded-xl py-3 px-4 text-sm font-medium">
                    آمين 🤲 جزاك الله خيراً
                  </div>
                )}
                <p className="text-xs text-athar-primary-400 dark:text-gray-500">
                  شارك في الأجر بنشر التطبيق أو الدعاء
                </p>
              </>
            ) : (
              <>
                <MessageCircleHeart className="w-10 h-10 text-athar-accent-500 mx-auto" />
                <h3 className="text-lg font-bold text-athar-text dark:text-gray-200">فضفض لأثر</h3>
                <p className="text-sm text-athar-text dark:text-gray-300 leading-relaxed">
                  هل تشعر بضيق، حزن، أو فرح؟ فضفض لأثر يسمعك، ويختار لك آية أو حديثاً أو قصة تلامس قلبك.
                </p>
                <button
                  onClick={() => {
                    handleCloseModal();
                    setShowFadfed(true);
                  }}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <MessageCircleHeart className="w-5 h-5" />
                  <span>ادخل فضفض لأثر</span>
                </button>
                <p className="text-xs text-athar-primary-400 dark:text-gray-500">
                  مكانك الآمن للفضفضة والمواساة
                </p>
              </>
            )}
          </div>
        </div>
      )}

      <Fadfed isOpen={showFadfed} onClose={() => setShowFadfed(false)} />
    </main>
  );
}
