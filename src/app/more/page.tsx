"use client";

import { useState, useEffect } from "react";
import { Heart, Share2, MessageCircle, Info, Trash2, Check, Trophy, Calendar, Bell, Rocket, BookOpen, Settings, Send } from "lucide-react";
import { WHATSAPP_LINK, APP_VERSION, WAQF_NAME, WAQF_DESCRIPTION } from "@/lib/constants";
import { trackSupportClick } from "@/lib/analytics";
import BottomNav from "@/components/BottomNav";

// ============================================================
// 1. دوال حساب النقاط والإنجازات (تعتمد على localStorage)
// ============================================================

interface UserStats {
  points: number;
  prayersRecorded: number;
  treePoints: number;
  khatmahPages: number;
  rank: number;
}

function calculateUserStats(): UserStats {
  // جلب البيانات من localStorage
  const recordedPrayers = localStorage.getItem("athar-recorded-prayers");
  const prayersCount = recordedPrayers ? JSON.parse(recordedPrayers).length : 0;
  
  const treePoints = parseInt(localStorage.getItem("athar-tree-completed") || "0");
  
  const khatmahProgress = localStorage.getItem("athar-khatmah-progress-v2");
  let khatmahPages = 0;
  if (khatmahProgress) {
    const progress = JSON.parse(khatmahProgress);
    khatmahPages = progress.currentPage || 0;
  }
  
  // مجموع النقاط (يمكن تعديل الوزن حسب رغبتك)
  const points = (prayersCount * 10) + (treePoints * 5) + (khatmahPages * 2);
  
  // محاكاة الترتيب (لاحقًا سيتم جلبه من قاعدة بيانات)
  const rank = points > 100 ? 15 : points > 50 ? 42 : 87;
  
  return {
    points,
    prayersRecorded: prayersCount,
    treePoints,
    khatmahPages,
    rank,
  };
}

// ============================================================
// 2. مكون لوحة الإنجازات والترتيب
// ============================================================
function AchievementsBoard({ stats }: { stats: UserStats }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-athar-bg-200 dark:border-gray-700 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-athar-accent-500" />
          <h3 className="font-semibold text-athar-text dark:text-gray-200">إنجازاتي</h3>
        </div>
        <span className="text-xs text-athar-text-muted">ترتيبي: #{stats.rank}</span>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="bg-athar-bg-100 dark:bg-gray-700/50 rounded-xl p-2">
          <p className="text-2xl font-bold text-athar-accent-500">{stats.points}</p>
          <p className="text-xs text-athar-text-muted">مجموع النقاط</p>
        </div>
        <div className="bg-athar-bg-100 dark:bg-gray-700/50 rounded-xl p-2">
          <p className="text-2xl font-bold text-athar-primary-600">{stats.prayersRecorded}</p>
          <p className="text-xs text-athar-text-muted">صلاة مسجلة</p>
        </div>
        <div className="bg-athar-bg-100 dark:bg-gray-700/50 rounded-xl p-2">
          <p className="text-2xl font-bold text-athar-secondary-500">{stats.treePoints}</p>
          <p className="text-xs text-athar-text-muted">نقاط الشجرة</p>
        </div>
        <div className="bg-athar-bg-100 dark:bg-gray-700/50 rounded-xl p-2">
          <p className="text-2xl font-bold text-athar-accent-500">{stats.khatmahPages}</p>
          <p className="text-xs text-athar-text-muted">صفحات ختمت</p>
        </div>
      </div>
      
      <div className="text-center text-xs text-athar-text-muted pt-1">
        🏆 كل صلاة: 10 نقاط • 🌱 كل ورقة شجرة: 5 نقاط • 📖 كل صفحة قرآن: نقطتان
      </div>
    </div>
  );
}

// ============================================================
// 3. مكون الختمة الذكية (تتبع الصفحة الفعلية للمستخدم)
// ============================================================
interface KhatmahProgress {
  currentPage: number;
  totalPages: number;
  completedKhatmah: number;
}

function KhatmahSection() {
  const [progress, setProgress] = useState<KhatmahProgress | null>(null);
  const [currentPageText, setCurrentPageText] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [pagesToRead, setPagesToRead] = useState<number>(1);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("athar-khatmah-progress-v2");
    if (saved) {
      setProgress(JSON.parse(saved));
    } else {
      const newProgress: KhatmahProgress = {
        currentPage: 1,
        totalPages: 604,
        completedKhatmah: 0,
      };
      localStorage.setItem("athar-khatmah-progress-v2", JSON.stringify(newProgress));
      setProgress(newProgress);
    }
  }, []);

  useEffect(() => {
    if (!progress) return;
    const fetchPagePreview = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://alquran.cloud/api/page/${progress.currentPage}/ar.alafasy`);
        const data = await res.json();
        if (data.code === 200 && data.data.ayahs.length > 0) {
          const firstAyah = data.data.ayahs[0];
          setCurrentPageText(firstAyah.text.slice(0, 150) + "...");
        } else {
          setCurrentPageText("لم نتمكن من جلب النص، حاول مرة أخرى.");
        }
      } catch (err) {
        setCurrentPageText("حدث خطأ، تأكد من اتصالك بالإنترنت.");
      }
      setLoading(false);
    };
    fetchPagePreview();
  }, [progress?.currentPage]);

  const recordPages = () => {
    if (!progress) return;
    if (pagesToRead < 1) {
      showMessage("يرجى إدخال عدد صفحات صحيح (1 على الأقل)", "error");
      return;
    }

    let newPage = progress.currentPage + pagesToRead;
    let newCompletedKhatmah = progress.completedKhatmah;
    let messageText = "";

    if (newPage > progress.totalPages) {
      const overshoot = newPage - progress.totalPages;
      newCompletedKhatmah += 1;
      newPage = overshoot > 0 ? overshoot : 1;
      messageText = `🎉 مبارك! أكملت ختمة رقم ${newCompletedKhatmah}. استمر من الصفحة ${newPage}`;
    } else {
      messageText = `📖 تم تسجيل ${pagesToRead} صفحة. وصلت إلى الصفحة ${newPage}`;
    }

    const updatedProgress: KhatmahProgress = {
      ...progress,
      currentPage: newPage,
      completedKhatmah: newCompletedKhatmah,
    };
    localStorage.setItem("athar-khatmah-progress-v2", JSON.stringify(updatedProgress));
    setProgress(updatedProgress);

    // تحديث نقاط الإنجازات (كل صفحة = نقطتان)
    const currentPoints = parseInt(localStorage.getItem("athar-khatmah-points") || "0");
    localStorage.setItem("athar-khatmah-points", (currentPoints + pagesToRead * 2).toString());

    showMessage(messageText, "success");

    // تحديث إحصائيات الصفحة الرئيسية (سجلي)
    const totalPagesRead = parseInt(localStorage.getItem("athar-total-pages-read") || "0");
    localStorage.setItem("athar-total-pages-read", (totalPagesRead + pagesToRead).toString());

    setPagesToRead(1);
  };

  const resetKhatmah = () => {
    if (confirm("هل تريد إعادة تعيين الختمة من البداية؟ سيتم فقدان التقدم الحالي.")) {
      const newProgress: KhatmahProgress = {
        currentPage: 1,
        totalPages: 604,
        completedKhatmah: 0,
      };
      localStorage.setItem("athar-khatmah-progress-v2", JSON.stringify(newProgress));
      setProgress(newProgress);
      localStorage.setItem("athar-khatmah-points", "0");
      showMessage("تم إعادة تعيين الختمة. ابدأ من الصفحة 1", "success");
    }
  };

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  if (!progress) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-athar-bg-200 dark:border-gray-700 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-athar-secondary-500" />
          <h3 className="font-semibold text-athar-text dark:text-gray-200">ختمتي الذكية</h3>
        </div>
        <button onClick={resetKhatmah} className="text-xs text-athar-text-muted underline">
          إعادة تعيين
        </button>
      </div>

      {loading ? (
        <div className="text-center py-4 text-athar-text-muted">جاري التحميل...</div>
      ) : (
        <>
          <div className="text-center">
            <p className="text-4xl font-bold text-athar-accent-500">{progress.currentPage}</p>
            <p className="text-xs text-athar-text-muted">الصفحة الحالية</p>
            {progress.completedKhatmah > 0 && (
              <p className="text-xs text-athar-secondary-500 mt-1">
                🎉 عدد الختمات: {progress.completedKhatmah}
              </p>
            )}
          </div>

          <div className="bg-athar-bg-100 dark:bg-gray-700/50 rounded-xl p-3 text-right">
            <p className="text-sm text-athar-text leading-relaxed">{currentPageText}</p>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-athar-text">عدد الصفحات المقروءة:</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPagesToRead((prev) => Math.max(1, prev - 1))} className="w-8 h-8 rounded-full bg-athar-primary-100 text-athar-primary-600 font-bold">
                -
              </button>
              <span className="w-12 text-center font-bold text-athar-text">{pagesToRead}</span>
              <button onClick={() => setPagesToRead((prev) => prev + 1)} className="w-8 h-8 rounded-full bg-athar-primary-100 text-athar-primary-600 font-bold">
                +
              </button>
            </div>
          </div>

          <button onClick={recordPages} className="w-full py-3 rounded-xl bg-athar-accent-500 text-white font-semibold text-base hover:bg-athar-accent-600 transition-colors active:scale-95">
            📖 سجل قراءة {pagesToRead} صفحة
          </button>

          {message && (
            <div className={`text-center text-sm p-2 rounded-xl ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {message.text}
            </div>
          )}

          <div className="flex justify-between gap-2 pt-2">
            <button onClick={() => window.open(`https://quran.com/${progress.currentPage}`, "_blank")} className="flex-1 py-2 rounded-xl bg-athar-primary-100 text-athar-primary-600 text-sm font-medium text-center hover:bg-athar-primary-200 transition-colors">
              اقرأ الصفحة كاملة 📖
            </button>
            <button onClick={() => window.open("https://quran.com", "_blank")} className="flex-1 py-2 rounded-xl bg-athar-bg-200 text-athar-text-muted text-sm font-medium text-center hover:bg-athar-bg-300 transition-colors">
              فتح المصحف 📚
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================
// 4. مكون إعدادات الإشعارات
// ============================================================
function NotificationSettings() {
  const [khatmahTime, setKhatmahTime] = useState<string>("07:00");
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [testResult, setTestResult] = useState<string>("");
  
  useEffect(() => {
    const savedTime = localStorage.getItem("athar-khatmah-notif-time");
    if (savedTime) setKhatmahTime(savedTime);
    const savedEnabled = localStorage.getItem("athar-notifications-enabled");
    if (savedEnabled !== null) setNotificationsEnabled(savedEnabled === "true");
  }, []);
  
  const saveSettings = () => {
    localStorage.setItem("athar-khatmah-notif-time", khatmahTime);
    localStorage.setItem("athar-notifications-enabled", String(notificationsEnabled));
    alert("تم حفظ إعدادات الإشعارات");
  };
  
  const sendTestNotification = async () => {
    if (!("Notification" in window) || Notification.permission !== "granted") {
      setTestResult("الإشعارات غير مفعلة. يرجى تفعيلها أولاً.");
      return;
    }
    try {
      const res = await fetch("/api/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "تجربة", body: "هذا إشعار تجريبي من تطبيق أثر" }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult(`تم إرسال الإشعار إلى ${data.sent} جهاز`);
      } else {
        setTestResult("فشل إرسال الإشعار، تأكد من وجود مشتركين.");
      }
    } catch (err) {
      setTestResult("حدث خطأ أثناء الإرسال");
    }
    setTimeout(() => setTestResult(""), 3000);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-athar-bg-200 dark:border-gray-700 space-y-4">
      <div className="flex items-center gap-2">
        <Bell className="w-5 h-5 text-athar-accent-500" />
        <h3 className="font-semibold text-athar-text dark:text-gray-200">إعدادات الإشعارات</h3>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-athar-text">تفعيل الإشعارات</span>
        <button onClick={() => setNotificationsEnabled(!notificationsEnabled)} className={`w-12 h-6 rounded-full transition-colors ${notificationsEnabled ? "bg-athar-accent-500" : "bg-gray-300"}`}>
          <span className={`block w-5 h-5 rounded-full bg-white transform transition-transform ${notificationsEnabled ? "translate-x-6" : "translate-x-1"}`} />
        </button>
      </div>
      
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-athar-text">تذكير الختمة الساعة</span>
        <input type="time" value={khatmahTime} onChange={(e) => setKhatmahTime(e.target.value)} className="px-2 py-1 rounded-lg border border-athar-bg-200 dark:bg-gray-700 dark:border-gray-600 text-sm" />
      </div>
      
      <button onClick={saveSettings} className="w-full py-2 rounded-xl bg-athar-accent-100 text-athar-accent-600 font-medium text-sm hover:bg-athar-accent-200 transition-colors">
        حفظ الإعدادات
      </button>
      
      <button onClick={sendTestNotification} className="w-full py-2 rounded-xl bg-athar-primary-100 text-athar-primary-600 font-medium text-sm hover:bg-athar-primary-200 transition-colors flex items-center justify-center gap-2">
        <Send className="w-4 h-4" />
        إرسال إشعار تجريبي
      </button>
      
      {testResult && <p className="text-xs text-center text-athar-text-muted">{testResult}</p>}
    </div>
  );
}

// ============================================================
// 5. الصفحة الرئيسية (المزيد) - Default Export
// ============================================================
export default function MorePage() {
  const [resetConfirm, setResetConfirm] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [stats, setStats] = useState<UserStats>({
    points: 0,
    prayersRecorded: 0,
    treePoints: 0,
    khatmahPages: 0,
    rank: 0,
  });
  
  useEffect(() => {
    setStats(calculateUserStats());
  }, []);
  
  const handleSupport = () => {
    trackSupportClick();
    window.open(WHATSAPP_LINK, "_blank");
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "أثر — كل يوم أثر نور",
        text: "تطبيق أثر، كل يوم أثر نور. وقف خيري عن مسلم عوده البويني رحمه الله",
        url: window.location.origin,
      });
    }
  };
  
  const handleResetStreak = () => {
    if (!resetConfirm) {
      setResetConfirm(true);
      return;
    }
    localStorage.removeItem("athar-streak");
    localStorage.removeItem("athar-last-visit");
    setResetConfirm(false);
    setResetDone(true);
    setTimeout(() => setResetDone(false), 3000);
  };
  
  return (
    <main className="min-h-screen pb-28 bg-athar-bg">
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Info className="w-6 h-6 text-athar-primary" />
          <h1 className="text-2xl font-bold text-athar-primary">المزيد</h1>
        </div>
      </header>
      
      <section className="px-4 py-2 space-y-4">
        <div className="athar-card text-center space-y-3">
          <Heart className="w-8 h-8 text-athar-accent mx-auto" />
          <div>
            <p className="text-sm font-medium text-athar-text">{WAQF_NAME}</p>
            <p className="text-xs text-athar-muted mt-1 leading-relaxed">{WAQF_DESCRIPTION}</p>
          </div>
          <button onClick={handleSupport} className="btn-primary flex items-center gap-2 mx-auto text-sm">
            <MessageCircle className="w-4 h-4" />
            تواصل معنا
          </button>
        </div>
        
        <AchievementsBoard stats={stats} />
        <KhatmahSection />
        <NotificationSettings />
        
        <button onClick={handleShare} className="athar-card flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <Share2 className="w-5 h-5 text-athar-primary" />
            <span className="text-sm font-medium text-athar-text">مشاركة التطبيق</span>
          </div>
          <span className="text-xs text-athar-muted">انشر الخير</span>
        </button>
        
        <div className="athar-card space-y-3">
          <div className="flex items-center gap-3">
            <Trash2 className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium text-athar-text">إعادة ضبط السلسلة</span>
          </div>
          <p className="text-xs text-athar-muted">سيتم حذف تقدم سلسلة النور من جهازك فقط</p>
          {resetDone ? (
            <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
              <Check className="w-4 h-4" />
              تمت إعادة الضبط
            </span>
          ) : (
            <button onClick={handleResetStreak} className={`text-sm font-medium px-4 py-2 rounded-xl transition-all ${resetConfirm ? "bg-red-500 text-white" : "bg-red-50 text-red-600 hover:bg-red-100"}`}>
              {resetConfirm ? "تأكيد إعادة الضبط" : "إعادة الضبط"}
            </button>
          )}
        </div>
        
        <p className="text-center text-xs text-athar-muted pt-4">نسخة {APP_VERSION}</p>
      </section>
      
      <BottomNav />
    </main>
  );
}
