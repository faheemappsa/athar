import { useEffect, useRef, useState } from "react";

const MIN_REFRESH_GAP_MS = 1200;

export const useAtharRefreshSignal = () => {
  const [signal, setSignal] = useState(0);
  const lastRefreshAtRef = useRef(0);

  useEffect(() => {
    const refresh = () => {
      const now = Date.now();
      if (now - lastRefreshAtRef.current < MIN_REFRESH_GAP_MS) return;
      lastRefreshAtRef.current = now;
      setSignal((value) => value + 1);
    };

    const onVisibility = () => {
      if (!document.hidden) refresh();
    };

    window.addEventListener("pageshow", refresh);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("pageshow", refresh);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return signal;
};
