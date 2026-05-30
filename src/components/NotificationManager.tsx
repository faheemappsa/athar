"use client";
import { useState, useEffect } from "react";

export default function NotificationManager() {
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
      if (Notification.permission === "default") {
        setShowBanner(true);
      }
    }
  }, []);

  // تحويل المفتاح العام من base64 إلى Uint8Array
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
    if (!("Notification" in window)) {
      alert("المتصفح لا يدعم الإشعارات");
      return;
    }

    const perm = await Notification.requestPermission();
    setPermission(perm);
    setShowBanner(false);

    if (perm === "granted") {
      try {
        // التسجيل في Push API
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

        // إرسال الاشتراك إلى الخادم
        const res = await fetch("/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subscription),
        });

        if (res.ok) {
          alert("تم تفعيل الإشعارات بنجاح! ستصل إليك التذكيرات حتى لو كان المتصفح مغلقاً.");
        } else {
          alert("تم تفعيل الإشعارات ولكن حدث خطأ في تسجيل الاشتراك.");
        }
      } catch (error) {
        console.error("Push subscription error:", error);
        alert("حدث خطأ أثناء تفعيل الإشعارات");
      }
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-24 left-0 right-0 z-50 flex justify-center px-4">
      <button
        onClick={requestPermissionAndSubscribe}
        className="bg-athar-accent-500 text-white px-6 py-3 rounded-full shadow-lg active:scale-95 transition-all"
      >
        🔔 فعّل الإشعارات (حتى لو كان المتصفح مغلقاً)
      </button>
    </div>
  );
}
