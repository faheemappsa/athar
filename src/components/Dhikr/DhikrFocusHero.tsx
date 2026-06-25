import { useEffect, useState } from "react";
import AppHero from "../Shared/AppHero";

export default function DhikrFocusHero() {
  const [focusMode, setFocusMode] = useState(false);

  useEffect(() => {
    const handleFocusMode = (event: Event) => {
      const detail = (event as CustomEvent<{ path?: string; active?: boolean }>).detail;
      if (detail?.path === "/dhikr") setFocusMode(Boolean(detail.active));
    };

    window.addEventListener("athar-focus-mode", handleFocusMode);
    return () => window.removeEventListener("athar-focus-mode", handleFocusMode);
  }, []);

  return (
    <div
      className={`overflow-hidden transition-all duration-300 ${
        focusMode ? "mb-0 max-h-0 -translate-y-5 opacity-0" : "mb-0 max-h-[180px] translate-y-0 opacity-100"
      }`}
    >
      <AppHero title="الأذكار" subtitle="تجربة يومية خفيفة وهادئة" />
    </div>
  );
}
