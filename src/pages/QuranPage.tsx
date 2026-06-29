import { useEffect, useRef, useState } from "react";
import Quran from "../components/Quran/Quran";
import { recordAtharBehavior } from "../experience/memory";
import { recordAtharSurfaceDailySignal } from "../experience/dailyIntelligence";
import { getQuranPageId } from "../experience/quranPageId";

const broadcastQuranFocus = (active: boolean) => {
  window.dispatchEvent(new CustomEvent("athar-focus-mode", { detail: { path: "/quran", active } }));
};

export default function QuranPage() {
  const [focusMode, setFocusMode] = useState(false);
  const focusRecordedRef = useRef(false);

  useEffect(() => {
    recordAtharBehavior({ type: "surface_view", surface: "quran-page", contentId: getQuranPageId() });
    recordAtharSurfaceDailySignal({ surface: "quran-page", type: "view" });
  }, []);

  useEffect(() => {
    const scrollElement = document.getElementById("app-scroll");
    if (!scrollElement) return;

    const setQuranFocusMode = (active: boolean) => {
      setFocusMode(active);
      broadcastQuranFocus(active);
      if (active && !focusRecordedRef.current) {
        focusRecordedRef.current = true;
        recordAtharBehavior({ type: "surface_focus", surface: "quran-page", contentId: getQuranPageId(), durationMs: 5000 });
        recordAtharSurfaceDailySignal({ surface: "quran-page", type: "focus" });
      }
    };

    const handleScroll = () => {
      const shouldFocus = scrollElement.scrollTop > 28;
      setQuranFocusMode(shouldFocus);
    };

    handleScroll();
    scrollElement.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      setQuranFocusMode(false);
      scrollElement.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="transition-all duration-300">
      <Quran focusMode={focusMode} />
    </div>
  );
}
