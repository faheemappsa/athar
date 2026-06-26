import { useEffect, useState } from "react";
import Quran from "../components/Quran/Quran";
import Footer from "../components/Footer/Footer";
import AppHero from "../components/Shared/AppHero";

const broadcastQuranFocus = (active: boolean) => {
  window.dispatchEvent(new CustomEvent("athar-focus-mode", { detail: { path: "/quran", active } }));
};

export default function QuranPage() {
  const [focusMode, setFocusMode] = useState(false);

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
    <div className="space-y-5 transition-all duration-300">
      <div
        className={`overflow-hidden transition-all duration-500 ease-out ${
          focusMode ? "max-h-0 -translate-y-3 opacity-0" : "max-h-52 translate-y-0 opacity-100"
        }`}
      >
        <AppHero title="المصحف" subtitle="قراءة هادئة ومتواصلة" />
      </div>
      <Quran focusMode={focusMode} />
      <Footer />
    </div>
  );
}
