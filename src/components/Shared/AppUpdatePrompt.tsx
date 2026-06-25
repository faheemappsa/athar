import { useEffect, useState } from "react";

export default function AppUpdatePrompt() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const handleRegistration = (registration: ServiceWorkerRegistration) => {
      if (registration.waiting) {
        setWaitingWorker(registration.waiting);
        setShowPrompt(true);
      }

      registration.addEventListener("updatefound", () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;

        installingWorker.addEventListener("statechange", () => {
          if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
            setWaitingWorker(installingWorker);
            setShowPrompt(true);
          }
        });
      });
    };

    navigator.serviceWorker.ready.then(handleRegistration).catch(() => {});

    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  }, []);

  if (!showPrompt || !waitingWorker) return null;

  const updateNow = () => {
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
    setShowPrompt(false);
  };

  return (
    <div className="fixed inset-x-4 top-[max(1rem,env(safe-area-inset-top))] z-[70] mx-auto max-w-sm rounded-[28px] border border-white/70 bg-white/85 p-3 text-right shadow-2xl shadow-black/10 backdrop-blur-2xl">
      <p className="text-sm font-bold text-primary-text">تحديث جديد متاح</p>
      <p className="mt-1 text-xs leading-5 text-secondary-text">اضغط التحديث لتعمل نسخة أثر الأحدث بدون حذف التطبيق.</p>
      <div className="mt-3 flex gap-2">
        <button onClick={updateNow} className="flex-1 rounded-full bg-action px-4 py-2 text-sm font-bold text-white">
          تحديث الآن
        </button>
        <button onClick={() => setShowPrompt(false)} className="rounded-full bg-primary-bg px-4 py-2 text-sm font-bold text-secondary-text">
          لاحقًا
        </button>
      </div>
    </div>
  );
}
