"use client";
import { useState, useEffect } from "react";
import { Moon, Sun, Heart, MessageCircle, X, MessageCircleHeart } from "lucide-react";
import { WHATSAPP_LINK } from "@/lib/constants";
import { trackSupportClick, trackAtharView } from "@/lib/analytics";
import AtharCard from "@/components/AtharCard";
import PrayerTimes from "@/components/PrayerTimes";
import TreeCard from "@/components/TreeCard";
import BottomNav from "@/components/BottomNav";
import Fadfed from "@/components/Fadfed";
import NameModal from "@/components/NameModal";

// دالة لجلب التاريخ الهجري من API الأذان
async function fetchHijriDate() {
  try {
    const response = await fetch("https://api.aladhan.com/v1/gToH?date=" + new Date().toISOString().split("T")[0]);
    const data = await response.json();
    if (data.code === 200) {
      return {
        day: data.data.hijri.day,
        month: data.data.hijri.month.ar,
        year: data.data.hijri.year,
        monthNumber: data.data.hijri.month.number,
      };
    }
  } catch (e) {
    console.error("فشل جلب التاريخ الهجري:", e);
  }
  return null;
}

// دالة لجلب أوقات الصلاة بناءً على المدينة (مكة مبدئياً)
async function fetchPrayerTimes(city = "Makkah", country = "SA") {
  try {
    const response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=2`);
    const data = await response.json();
    if (data.code === 200) {
      return data.data.timings;
    }
  } catch (e) {
    console.error("فشل جلب أوقات الصلاة:", e);
  }
  return null;
}

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
  const [hijri, setHijri] = useState<{ day: string; month: string; year: string; monthNumber: number } | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<any>(null);

  // جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    fetchHijriDate().then(setHijri);
    fetchPrayerTimes().then(setPrayerTimes);
  }, []);

  // الأذونات والإشعارات والوضع الليلي... (نفس الكود السابق مع الحفاظ على الوظائف)
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

  // جدولة الإشعارات (نفس الكود السابق)
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

  const handleRecordAttendance = () => {
    if (!userName) {
      setShowNameModal(true);
      return;
    }
    const today = new Date().toDateString();
    localStorage.setItem("athar-last-check", today);
    setIsCheckedToday(true);
    setShowDuaModal(true);
    setDuaSent(false);
    setShowFadfedInvite(false);
  };

  const handleNameSave = (name: string) => {
    setUserName(name);
    localStorage.setItem("athar-user-name", name);
    setShowNameModal(false);
    const today = new Date().toDateString();
    localStorage.setItem("athar-last-check", today);
    setIsCheckedToday(true);
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

  // ==================== شريط الترحيب الديناميكي النقي (بدون أزرار) ====================
  const now = currentTime;
  const hour = now.getHours();
  const day = now.getDate();
  const isFriday = now.getDay() === 5;
  const isWhiteDays = hijri ? (hijri.day >= "13" && hijri.day <= "15") : (day >= 13 && day <= 15);
  
  const nameRef = userName ? userName : "الحبيب";

  let greetingText = "";
  let duaText = "";
  let subText = "";
  let greetingEmoji = "";
  let specialTag = "";

  // استخدام أوقات الصلاة من API إن وجدت، وإلا استخدام الساعة
  let currentPrayer = "";
  if (prayerTimes) {
    const nowMinutes = hour * 60 + now.getMinutes();
    const fajr = prayerTimes.Fajr.split(":").map(Number);
    const dhuhr = prayerTimes.Dhuhr.split(":").map(Number);
    const asr = prayerTimes.Asr.split(":").map(Number);
    const maghrib = prayerTimes.Maghrib.split(":").map(Number);
    const isha = prayerTimes.Isha.split(":").map(Number);
    const fajrMinutes = fajr[0] * 60 + fajr[1];
    const dhuhrMinutes = dhuhr[0] * 60 + dhuhr[1];
    const asrMinutes = asr[0] * 60 + asr[1];
    const maghribMinutes = maghrib[0] * 60 + maghrib[1];
    const ishaMinutes = isha[0] * 60 + isha[1];
    
    if (nowMinutes < fajrMinutes) currentPrayer = "قبل الفجر";
    else if (nowMinutes < dhuhrMinutes) currentPrayer = "بعد الفجر";
    else if (nowMinutes < asrMinutes) currentPrayer = "الظهر";
    else if (nowMinutes < maghribMinutes) currentPrayer = "العصر";
    else if (nowMinutes < ishaMinutes) currentPrayer = "المغرب";
    else currentPrayer = "العشاء";
  } else {
    // Fallback على الساعة
    if (hour >= 3 && hour < 6) currentPrayer = "قبل الفجر";
    else if (hour >= 6 && hour < 12) currentPrayer = "الصباح";
    else if (hour >= 12 && hour < 15) currentPrayer = "الظهر";
    else if (hour >= 15 && hour < 18) currentPrayer = "العصر";
    else if (hour >= 18 && hour < 20) currentPrayer = "المغرب";
    else if (hour >= 20 && hour < 23) currentPrayer = "العشاء";
    else currentPrayer = "الليل";
  }

  // بناء النصوص حسب الوقت الحقيقي
  if (currentPrayer === "قبل الفجر") {
    greetingText = `⭐ هلا بك يا ${nameRef}، باقي على الفجر ساعة`;
    duaText = "اللهم بارك لنا في سحرنا واغفر لنا";
    subText = "وقت السحر، الدعاء مستجاب";
    greetingEmoji = "🌙✨";
  } else if (currentPrayer === "بعد الفجر") {
    greetingText = `☀️ صباح النور يا ${nameRef}`;
    duaText = "اللهم اجعل يومنا مليئاً بالبركات";
    subText = "اذكر الله بعد الفجر، فهو وقت نور";
    greetingEmoji = "☀️🌸";
  } else if (currentPrayer === "الظهر") {
    greetingText = `🌤️ هلا بك يا ${nameRef}`;
    duaText = "اللهم لا تكلنا إلى أنفسنا طرفة عين";
    subText = "حان وقت الظهر، لا تنس أذكار الظهر";
    greetingEmoji = "🌿💚";
  } else if (currentPrayer === "العصر") {
    greetingText = `🍂 عصرك مبارك يا ${nameRef}`;
    duaText = "اللهم احفظ لنا أثرنا وأيامنا";
    subText = "وقت العصر، يتضاعف فيه الأجر";
    greetingEmoji = "📖🍃";
  } else if (currentPrayer === "المغرب") {
    greetingText = `🌆 مساء الخير يا ${nameRef}`;
    duaText = "اللهم أسعد مساءنا بالمغفرة";
    subText = "بعد المغرب، أذكار المساء";
    greetingEmoji = "🌙📖";
  } else if (currentPrayer === "العشاء") {
    greetingText = `🌙 هدوء الليل يا ${nameRef}`;
    duaText = "اللهم إني أسألك خير هذا الليل";
    subText = "تهجد قبل النوم، فالدعاء لا يرد";
    greetingEmoji = "⭐🕯️";
  } else {
    greetingText = `🌙 ليلك سعيد يا ${nameRef}`;
    duaText = "اللهم احفظنا بنورك";
    subText = "نم على ذكر الله";
    greetingEmoji = "🌙✨";
  }

  // لمسات خاصة بالمناسبات
  if (isFriday) {
    specialTag = "⭐️ يوم الجمعة المبارك ⭐️";
    duaText = "اللهم اجعل جمعتنا خير جمع";
  } else if (isWhiteDays && hijri) {
    specialTag = `🌕 الأيام البيض (${hijri.day} ${hijri.month}) 🌕`;
    duaText = "اللهم اجعل أعمالنا فيها خالصة لوجهك";
  } else if (hijri && hijri.month === "رمضان") {
    specialTag = `🌙 شهر رمضان المبارك 🌙`;
    duaText = "اللهم بلغنا رمضان واغفر لنا";
  }

  return (
    <main className="min-h-screen bg-athar-bg pb-28">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4">
        <button
          onClick={toggleDarkMode}
          className="p-3.5 rounded-full bg-white shadow-sm transition-all hover:bg-gray-100 dark:bg-gray-800 active:scale-95 touch-manipulation"
          style={{ touchAction: "manipulation" }}
        >
          {isDark ? <Sun className="w-5 h-5 text-athar-secondary-400" /> : <Moon className="w-5 h-5 text-athar-primary-500" />}
        </button>
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-athar-primary-600 dark:text-athar-secondary-400">أثر</h1>
          <p className="text-sm text-athar-text-muted font-medium mt-0.5">أثرك باقٍ ماتنقطع</p>
        </div>
        <button
          onClick={handleHeartClick}
          className="p-3.5 rounded-full bg-white shadow-sm transition-all hover:bg-rose-50 dark:bg-gray-800 active:scale-95 touch-manipulation"
          style={{ touchAction: "manipulation" }}
        >
          <Heart className="w-5 h-5 text-rose-500 dark:text-rose-400" />
        </button>
      </header>

      {/* شريط الترحيب النقي (بدون أزرار) */}
      <section className="px-5 mt-2">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-athar-bg-200 dark:border-gray-700 transition-all">
          {specialTag && (
            <div className="text-center text-sm font-bold text-athar-secondary-500 mb-2">{specialTag}</div>
          )}
          <div className="flex items-center justify-center gap-2 text-athar-primary-600 dark:text-gray-200">
            <span className="text-xl">{greetingEmoji}</span>
            <p className="text-base font-semibold">{greetingText}</p>
          </div>
          <p className="text-sm text-athar-text dark:text-gray-300 text-center mt-2 leading-relaxed">{duaText}</p>
          <p className="text-xs text-athar-text-muted dark:text-gray-500 text-center mt-1">{subText}</p>
        </div>
      </section>

      {/* بطاقة أثر اليوم */}
      <div className="px-5 mt-6"><AtharCard /></div>

      {/* مواقيت الصلاة */}
      <div className="px-5 mt-6"><PrayerTimes /></div>

      {/* شجرة الأثر */}
      <div className="px-5 mt-6"><TreeCard userName={userName} /></div>

      {/* بطاقة الصدقة الجارية */}
      <section className="px-5 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 text-center border border-athar-bg-200 dark:border-gray-700 shadow-sm">
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

      <NameModal isOpen={showNameModal} onSave={handleNameSave} onClose={() => setShowNameModal(false)} />

      {/* Modal الدعاء (نفس الكود السابق) */}
      {showDuaModal && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-sm w-full text-center space-y-5 shadow-2xl animate-scale-up relative">
            <button onClick={handleCloseModal} className="absolute top-4 left-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
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
                  <button onClick={handleAmeen} className="btn-primary w-full flex items-center justify-center gap-2">
                    <span>آمين</span><span className="text-lg">🤲</span>
                  </button>
                ) : (
                  <div className="bg-athar-primary-100 dark:bg-athar-primary-800/20 text-athar-primary-600 dark:text-athar-secondary-400 rounded-xl py-3 px-4 text-sm font-medium">
                    آمين 🤲 جزاك الله خيراً
                  </div>
                )}
                <p className="text-xs text-athar-text-muted dark:text-gray-500">شارك في الأجر بنشر التطبيق أو الدعاء</p>
              </>
            ) : (
              <>
                <MessageCircleHeart className="w-10 h-10 text-athar-secondary-500 mx-auto" />
                <h3 className="text-lg font-bold text-athar-text dark:text-gray-200">فضفض لأثر</h3>
                <p className="text-sm text-athar-text dark:text-gray-300 leading-relaxed">
                  هل تشعر بضيق، حزن، أو فرح؟ فضفض لأثر يسمعك، ويختار لك آية أو حديثاً أو قصة تلامس قلبك.
                </p>
                <button onClick={() => { handleCloseModal(); setShowFadfed(true); }} className="btn-primary w-full flex items-center justify-center gap-2">
                  <MessageCircleHeart className="w-5 h-5" /><span>ادخل فضفض لأثر</span>
                </button>
                <p className="text-xs text-athar-text-muted dark:text-gray-500">مكانك الآمن للفضفضة والمواساة</p>
              </>
            )}
          </div>
        </div>
      )}

      <Fadfed isOpen={showFadfed} onClose={() => setShowFadfed(false)} />
    </main>
  );
}
