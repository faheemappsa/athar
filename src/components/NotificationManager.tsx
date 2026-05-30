"use client";
import { useState, useEffect } from "react";

export default function NotificationManager() {
  const [showBanner, setShowBanner] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | null>(null);

  // مفاتيح التخزين للمستخدم
  const STORAGE_KEYS = {
    LAST_PROMPT: "athar-notif-last-prompt",    // تاريخ آخر طلب
    REFUSAL_COUNT: "athar-notif-refusal-count", // عدد مرات الرفض
    DISMISS_COUNT: "athar-notif-dismiss-count", // عدد مرات الإغلاق بدون قرار
  };

  useEffect(() => {
    if (!("Notification" in window)) return;

    const currentPermission = Notification.permission;
    setPermission(currentPermission);

    // إذا كان ممنوعاً نهائياً (رفض سابق) -> لا نظهر له شيئاً أبداً
    if (currentPermission === "denied") {
      setShowBanner(false);
      return;
    }

    // إذا كان مفعلاً -> لا نظهر له شيئاً
    if (currentPermission === "granted") {
      setShowBanner(false);
      return;
    }

    // الحالة: "default" (لم يقرر بعد) -> نحتاج إلى استراتيجية ذكية
    const lastPrompt = localStorage.getItem(STORAGE_KEYS.LAST_PROMPT);
    const refusalCount = parseInt(localStorage.getItem(STORAGE_KEYS.REFUSAL_COUNT) || "0");
    const dismissCount = parseInt(localStorage.getItem(STORAGE_KEYS.DISMISS_COUNT) || "0");

    const now = Date.now();
    const threeDays = 3 * 24 * 60 * 60 * 1000; // 3 أيام
    const visits = parseInt(localStorage.getItem("athar-visit-count") || "0");

    // شروط الظهور الذكية:
    let shouldShow = false;

    if (!lastPrompt) {
      // أول مرة يزور التطبيق -> ننتظر 3 زيارات على الأقل قبل أن نطلب
      if (visits >= 3) shouldShow = true;
    } else {
      const timeSinceLastPrompt = now - parseInt(lastPrompt);
      if (refusalCount === 0 && dismissCount === 0) {
        // لم يرفض أو يغلق من قبل -> نذكره بعد 3 أيام فقط
        if (timeSinceLastPrompt > threeDays) shouldShow = true;
      } else if (refusalCount === 1 && dismissCount === 0) {
        // رفض مرة واحدة -> نذكره بعد 7 أيام
        if (timeSinceLastPrompt > 7 * 24 * 60 * 60 * 1000) shouldShow = true;
      } else if (dismissCount === 1 && refusalCount === 0) {
        // أغلق مرة واحدة -> نذكره بعد 3 أيام
        if (timeSinceLastPrompt > threeDays) shouldShow = true;
      } else {
        // رفض أو أغلق أكثر من مرة -> لا نظهر له أبداً
        shouldShow = false;
      }
    }

    setShowBanner(shouldShow);
  }, []);

  // تسجيل عدد الزيارات (يتم استدعاؤه مرة واحدة)
  useEffect(() => {
    const visits = localStorage.getItem("athar-visit-count");
    const newCount = visits ? parseInt(visits) + 1 : 1;
    localStorage.setItem("athar-visit-count", newCount.toString());
  }, []);

  function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  const requestPermissionAndSubscribe = async () => {
    // تسجيل وقت الطلب الحالي
    localStorage.setItem(STORAGE_KEYS.LAST_PROMPT, Date.now().toString());

    const perm = await Notification.requestPermission();
    setPermission(perm);

    if (perm === "granted") {
      // نجاح: نمسح سجلات الرفض والتجاهل
      localStorage.removeItem(STORAGE_KEYS.REFUSAL_COUNT);
      localStorage.removeItem(STORAGE_KEYS.DISMISS_COUNT);
      setShowBanner(false);

      try {
        const registration = await navigator.serviceWorker.ready;
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
          console.error("VAPID public key missing");
          alert("حدث خطأ في تهيئة الإشعارات");
          return;
        }

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });

        await fetch("/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subscription),
        });

        alert("✅ تم تفعيل الإشعارات! ستصل إليك التذكيرات حتى لو كان المتصفح مغلقاً.");
      } catch (error) {
        console.error("Push subscription error:", error);
        alert("تم تفعيل الإشعارات ولكن حدث خطأ في التسجيل.");
      }
    } else if (perm === "denied") {
      // رفض: نزيد عدد مرات الرفض
      const refusalCount = parseInt(localStorage.getItem(STORAGE_KEYS.REFUSAL_COUNT) || "0");
      localStorage.setItem(STORAGE_KEYS.REFUSAL_COUNT, (refusalCount + 1).toString());
      setShowBanner(false);
      // رسالة لطيفة بدلاً من التنبيه المزعج
      console.log("يمكنك تفعيل الإشعارات لاحقاً من إعدادات المتصفح");
    } else {
      // default: أغلق النافذة دون قرار -> نزيد عدد مرات التجاهل
      const dismissCount = parseInt(localStorage.getItem(STORAGE_KEYS.DISMISS_COUNT) || "0");
      localStorage.setItem(STORAGE_KEYS.DISMISS_COUNT, (dismissCount + 1).toString());
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    // المستخدم يغلق الزر يدوياً
    const dismissCount = parseInt(localStorage.getItem(STORAGE_KEYS.DISMISS_COUNT) || "0");
    localStorage.setItem(STORAGE_KEYS.DISMISS_COUNT, (dismissCount + 1).toString());
    localStorage.setItem(STORAGE_KEYS.LAST_PROMPT, Date.now().toString());
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-24 left-0 right-0 z-50 flex justify-center px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 max-w-sm w-full border border-athar-primary-200 dark:border-gray-700">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="text-athar-text dark:text-gray-200 font-semibold text-sm">
              🔔 لا تفوت أثرك اليومي
            </p>
            <p className="text-xs text-athar-text-muted dark:text-gray-400 mt-1">
              فعّل الإشعارات لتصلك تذكيرات الصلاة والأذكار الجديدة.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={requestPermissionAndSubscribe}
            className="flex-1 bg-athar-accent-500 text-white py-2 rounded-xl text-sm font-medium active:scale-95 transition-all"
          >
            تفعيل
          </button>
          <button
            onClick={handleDismiss}
            className="flex-1 bg-gray-100 dark:bg-gray-700 text-athar-text-muted py-2 rounded-xl text-sm font-medium active:scale-95 transition-all"
          >
            لاحقاً
          </button>
        </div>
      </div>
    </div>
  );
}
