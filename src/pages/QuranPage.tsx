import { useEffect, useState } from "react";
import Quran from "../components/Quran/Quran";
import { recordAtharBehavior } from "../experience/memory";

const broadcastQuranFocus = (active: boolean) => {
  window.dispatchEvent(new CustomEvent("athar-focus-mode", { detail: { path: "/quran", active } }));
};

export default function QuranPage() {
  const [focusMode, setFocusMode] = useState(false);

  useEffect(() => {
    recordAtharBehavior({ type: "surface_view", surface: "quran-page", contentId: "quran-page" });
  }, []);

  useEffect(() => {
    const scrollElement = document.getElementById("app-scroll");
    if (!scrollElement) return;

    const setQuranFocusMode = (active: boolean) => {
      setFocusMode(active);
      broadcastQuranFocus(active);
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
