import { useEffect } from "react";
import Dhikr from "../components/Dhikr/Dhikr";
import DhikrFocusHero from "../components/Dhikr/DhikrFocusHero";
import Footer from "../components/Footer/Footer";

export default function DhikrPage() {
  useEffect(() => {
    const scrollElement = document.getElementById("app-scroll");
    if (!scrollElement) return;

    const setFocusMode = (active: boolean) => {
      window.dispatchEvent(new CustomEvent("athar-focus-mode", { detail: { path: "/dhikr", active } }));
    };

    const handleScroll = () => {
      setFocusMode(scrollElement.scrollTop > 28);
    };

    handleScroll();
    scrollElement.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      setFocusMode(false);
      scrollElement.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="space-y-5 transition-all duration-300">
      <DhikrFocusHero />
      <Dhikr />
      <Footer />
    </div>
  );
}
