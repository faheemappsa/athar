import { useEffect, useState } from "react";

export default function ConnectionBanner() {
  const [offline, setOffline] = useState(() => typeof navigator !== "undefined" && !navigator.onLine);

  useEffect(() => {
    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  if (!offline) return null;

  return <div className="mb-4 rounded-full bg-white/90 px-4 py-3 text-center text-sm font-bold text-secondary-text shadow-lg shadow-action/10 backdrop-blur">☁️ أنت تستخدم تطبيق أثر بدون إنترنت</div>;
}
