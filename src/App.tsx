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
import { trackEvent } from "./utils/analytics";

const AnalyticsPageView = () => {
  const location = useLocation();

  useEffect(() => {
    trackEvent("page_view", {
      page_path: `${location.pathname}${location.search}`,
      page_title: document.title,
    });
  }, [location.pathname, location.search]);

  return null;
};

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AnalyticsPageView />
        <div className="fixed inset-0 w-full overflow-hidden bg-primary-bg font-arabic">
          <AppIntro />
          <InstallPrompt />
          <ScrollMemory />
          <main id="app-scroll" className="app-scroll h-full w-full overflow-y-auto px-4 pb-28 pt-10">
            <div className="mx-auto w-full max-w-md">
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
      </BrowserRouter>
    </ErrorBoundary>
  );
}
