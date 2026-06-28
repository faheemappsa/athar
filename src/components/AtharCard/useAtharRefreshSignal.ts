import { useEffect, useState } from "react";

export const useAtharRefreshSignal = () => {
  const [signal, setSignal] = useState(0);

  useEffect(() => {
    const refresh = () => setSignal((value) => value + 1);
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
