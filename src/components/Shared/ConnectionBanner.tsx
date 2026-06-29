import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ONLINE_HIDE_DELAY_MS = 2600;

type ConnectionStatus = "online" | "offline";

const getInitialStatus = (): ConnectionStatus => {
  if (typeof navigator === "undefined") return "online";
  return navigator.onLine ? "online" : "offline";
};

export default function ConnectionBanner() {
  const [status, setStatus] = useState<ConnectionStatus>(getInitialStatus);
  const [showOnlineReturn, setShowOnlineReturn] = useState(false);

  useEffect(() => {
    let onlineTimer: number | undefined;

    const handleOnline = () => {
      setStatus("online");
      setShowOnlineReturn(true);
      window.clearTimeout(onlineTimer);
      onlineTimer = window.setTimeout(() => setShowOnlineReturn(false), ONLINE_HIDE_DELAY_MS);
    };

    const handleOffline = () => {
      window.clearTimeout(onlineTimer);
      setShowOnlineReturn(false);
      setStatus("offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.clearTimeout(onlineTimer);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const isOffline = status === "offline";
  const shouldShow = isOffline || showOnlineReturn;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22 }}
          role="status"
          aria-live="polite"
          className={`mx-4 mb-3 mt-2 rounded-2xl border px-4 py-3 text-center text-sm font-bold shadow-sm backdrop-blur ${
            isOffline
              ? "border-amber-200 bg-amber-50/95 text-amber-900"
              : "border-action/15 bg-white/95 text-action"
          }`}
        >
          {isOffline ? "أنت الآن بدون اتصال — المحتوى المحفوظ سيبقى متاحًا" : "عاد الاتصال"}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
