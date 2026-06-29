import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import "./index.css";
import BottomNav from "./components/Navigation/BottomNav";
import HomePage from "./pages/HomePage";
import DhikrPage from "./pages/DhikrPage";
import QuranPage from "./pages/QuranPage";
import RadioPage from "./pages/RadioPage";
import PageTransition from "./components/Shared/PageTransition";
import ErrorBoundary from "./components/Shared/ErrorBoundary";
import InstallPrompt from "./components/Shared/InstallPrompt";
import ScrollMemory from "./components/Shared/ScrollMemory";
import AppIntro from "./components/Shared/AppIntro";
import ConnectionBanner from "./components/Shared/ConnectionBanner";
import AppUpdatePrompt from "./components/Shared/AppUpdatePrompt";
import { useActiveSection } from "./hooks/useActiveSection";
import { runAtharBrain } from "./experience/brain";
import { recordAtharAppReturn, recordAtharSectionVisit } from "./experience/dailyIntelligence";
import { trackEvent } from "./utils/analytics";

const getSectionFromPath = (pathname: string) => {
  if (pathname.startsWith("/dhikr")) return "dhikr" as const;
  if (pathname.startsWith("/quran")) return "quran" as const;
  if (pathname.startsWith("/radio")) return "radio" as const;
  return "home" as const;
};

const AnalyticsPageView = () => {
  const location = useLocation();

  useEffect(() => {
    trackEvent("page_view", {
      page_path: `${location.pathname}${location.search}`,
      page_title: document.title,
    });
    recordAtharSectionVisit(getSectionFromPath(location.pathname));
  }, [location.pathname, location.search]);

  return null;
};

const AppShell = () => {
  const section = useActiveSection();

  useEffect(() => {
    const decision = runAtharBrain();
    trackEvent("athar_brain_decision", {
      state: decision.state,
      score: decision.score,
      time_band: decision.entry.timeBand,
      visit_count: decision.entry.visitCount,
    });
  }, []);

  useEffect(() => {
    const handleReturn = () => recordAtharAppReturn();
    const handleVisibility = () => {
      if (!document.hidden) recordAtharAppReturn();
    };

    window.addEventListener("pageshow", handleReturn);
    window.addEventListener("focus", handleReturn);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("pageshow", handleReturn);
      window.removeEventListener("focus", handleReturn);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <div className="app-shell" data-section={section.key} data-context={section.context}>
      <AppIntro />
      <InstallPrompt />
      <AppUpdatePrompt />
      <ScrollMemory />
      <main id="app-scroll" className="app-scroll">
        <div className="mx-auto w-full max-w-md">
          <ConnectionBanner />
          <Routes>
            <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
            <Route path="/dhikr" element={<PageTransition><DhikrPage /></PageTransition>} />
            <Route path="/quran" element={<PageTransition><QuranPage /></PageTransition>} />
            <Route path="/radio" element={<PageTransition><RadioPage /></PageTransition>} />
          </Routes>
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AnalyticsPageView />
        <AppShell />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
