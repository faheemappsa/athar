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

  // ==================== النصوص الترحيبية الثورية (بلهجة خليجية وديناميكية) ====================
  const hour = currentTime.getHours();
  const day = currentTime.getDate();
  const month = currentTime.getMonth();
  
  // هل اليوم جمعة؟ (لتحية خاصة)
  const isFriday = currentTime.getDay() === 5;
  // هل هي الأيام البيض؟ (13،14،15 من الشهر الهجري - تقريب حسب التاريخ الميلادي)
  const isWhiteDays = (day >= 13 && day <= 15);
  
  let greetingText = "";
  let duaText = "";
  let subText = "";
  let greetingEmoji = "";
  let specialTag = "";

  const nameRef = userName ? userName : "الحبيب";

  // تحيات ديناميكية بلهجة خليجية
  if (hour >= 3 && hour < 6) {
    greetingText = `🌙 هلا بك يا ${nameRef}، الفجر نادى`;
    duaText = "اللهم بارك لنا في بكورنا واغفر لنا";
    subText = "باقي على الفجر كم دقيقة؟ جهز وضوئك";
    greetingEmoji = "🌙✨";
  } else if (hour >= 6 && hour < 12) {
    greetingText = `☀️ صباح النور يا ${nameRef}`;
    duaText = "اللهم اجعل نهارنا مليان بركة ونور";
    subText = "ابدأ يومك بذكر أو خاطرة";
    greetingEmoji = "☀️🌸";
  } else if (hour >= 12 && hour < 17) {
    greetingText = `🌤️ هلا وغلا يا ${nameRef}، كيف نهارك؟`;
    duaText = "اللهم لا تكلنا إلى أنفسنا طرفة عين";
    subText = "ما نسيت أذكار الظهر؟";
    greetingEmoji = "🌿💚";
  } else if (hour >= 17 && hour < 21) {
    greetingText = `🌆 مساء النور يا ${nameRef}`;
    duaText = "اللهم أسعد مساءنا واغفر لنا";
    subText = "حان وقت أذكار المساء والفضفضة";
    greetingEmoji = "🌙📖";
  } else {
    greetingText = `🌙 هدوء الليل يا ${nameRef}`;
    duaText = "اللهم إني أسألك خير هذا الليل";
    subText = "جهز نفسك لليلة هانئة";
    greetingEmoji = "⭐🕯️";
  }

  // إضافة لمسات خاصة للمناسبات
  if (isFriday) {
    specialTag = "⭐️ يوم الجمعة المبارك ⭐️";
    duaText = "اللهم اجعل جمعتنا خير جمع، وتقبل صلاتنا ودعائنا";
  } else if (isWhiteDays) {
    specialTag = "🌕 الأيام البيض 🌕";
    duaText = "اللهم اجعل أعمالنا فيها خالصة لوجهك";
  }

  // إضافة تحفيز إذا لم يثبت البصمة بعد
  const reminderBanner = !isCheckedToday ? (
    <div className="mt-2 flex items-center justify-center gap-1 text-xs text-athar-secondary-500 animate-pulse">
      <Sparkles className="w-3 h-3" />
      <span>يا ${nameRef}، لسى ما ثبت بصمتك اليوم! اضغط على القلب 🤲 واكتب دعوة طيبة</span>
    </div>
  ) : null;

  return (
    <main className="min-h-screen bg-athar-bg pb-28">
      {/* Header - شريط علوي محسن للإبهام */}
      <header className="flex items-center justify-between px-5 py-4">
        <button
          onClick={toggleDarkMode}
          className="p-3 rounded-full bg-white shadow-sm transition-all hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 active:scale-95"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-athar-secondary-400" />
          ) : (
            <Moon className="w-5 h-5 text-athar-primary-500" />
          )}
        </button>
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-athar-primary-600 dark:text-athar-secondary-400">أثر</h1>
          <p className="text-xs text-athar-text-muted font-medium mt-0.5">أثرك باقٍ ماتنقطع</p>
        </div>
        <button
          onClick={handleHeartClick}
          className="p-3 rounded-full bg-white shadow-sm transition-all hover:bg-rose-50 dark:bg-gray-800 dark:hover:bg-rose-900/30 active:scale-95"
        >
          <Heart className="w-5 h-5 text-athar-primary-500 dark:text-athar-secondary-400" />
        </button>
      </header>

      {/* شريط الترحيب الذكي الثوري */}
      <section className="px-5 mt-2">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-athar-bg-200 dark:border-gray-700 transition-all">
          {specialTag && (
            <div className="text-center text-sm font-bold text-athar-secondary-500 mb-2">
              {specialTag}
            </div>
          )}
          <div className="flex items-center justify-center gap-2 text-athar-primary-600 dark:text-gray-200">
            <span className="text-xl">{greetingEmoji}</span>
            <p className="text-base font-semibold">{greetingText}</p>
          </div>
          <p className="text-sm text-athar-text dark:text-gray-300 text-center mt-2 leading-relaxed">
            {duaText}
          </p>
          <p className="text-xs text-athar-text-muted dark:text-gray-500 text-center mt-1">
            {subText}
          </p>
          {reminderBanner}
        </div>
      </section>

      {/* بطاقة أثر اليوم */}
      <div className="px-5 mt-5">
        <AtharCard />
      </div>

      {/* مواقيت الصلاة */}
      <div className="px-5 mt-5">
        <PrayerTimes />
      </div>

      {/* شجرة الأثر */}
      <div className="px-5 mt-5">
        <TreeCard userName={userName} />
      </div>

      {/* بطاقة الصدقة الجارية */}
      <section className="px-5 mt-5">
        <div className="bg-athar-primary-50 dark:bg-athar-primary-900/20 rounded-2xl p-5 text-center border border-athar-primary-100 dark:border-gray-700">
          <p className="text-sm text-athar-text dark:text-gray-300 leading-relaxed">
            هذا الأثر الجاري صدقة عن{" "}
            <span className="text-athar-primary-600 dark:text-athar-secondary-400 font-medium">مسلم عوده البويني</span>{" "}
            رحمه الله
          </p>
          <button
            onClick={handleSupportClick}
            className="mt-3 text-sm text-athar-secondary-600 dark:text-athar-secondary-400 font-medium flex items-center justify-center gap-1 mx-auto hover:underline"
          >
            <MessageCircle className="w-4 h-4" />
            تواصل معنا
          </button>
        </div>
      </section>

      <BottomNav />

      {/* NameModal */}
      <NameModal
        isOpen={showNameModal}
        onSave={handleNameSave}
        onClose={() => setShowNameModal(false)}
      />

      {/* Modal الدعاء */}
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
                <Heart className="w-10 h-10 text-athar-secondary-500 mx-auto" />
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
                  <div className="bg-athar-primary-100 dark:bg-athar-primary-800/20 text-athar-primary-600 dark:text-athar-secondary-400 rounded-xl py-3 px-4 text-sm font-medium">
                    آمين 🤲 جزاك الله خيراً
                  </div>
                )}
                <p className="text-xs text-athar-text-muted dark:text-gray-500">
                  شارك في الأجر بنشر التطبيق أو الدعاء
                </p>
              </>
            ) : (
              <>
                <MessageCircleHeart className="w-10 h-10 text-athar-secondary-500 mx-auto" />
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
                <p className="text-xs text-athar-text-muted dark:text-gray-500">
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
