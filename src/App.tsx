import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import "./index.css";
import BottomNav from "./components/Navigation/BottomNav";
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
import { applySeoRoute } from "./config/seo";
import { trackEvent } from "./utils/analytics";

const HomePage = lazy(() => import("./pages/HomePage"));
const DhikrPage = lazy(() => import("./pages/DhikrPage"));
const QuranPage = lazy(() => import("./pages/QuranPage"));
const RadioPage = lazy(() => import("./pages/RadioPage"));
const AdminAnalyticsPage = lazy(() => import("./pages/AdminAnalyticsPage"));

const RouteFallback = () => (
  <div className="px-5 py-8 text-center text-sm text-[#7A6A5A]" aria-live="polite">
    جاري تحميل أثر...
  </div>
);

const withRouteShell = (page: React.ReactNode) => (
  <Suspense fallback={<RouteFallback />}>
    <PageTransition>{page}</PageTransition>
  </Suspense>
);

const getSectionFromPath = (pathname: string) => {
  if (pathname.startsWith("/admin")) return null;
  if (pathname.startsWith("/dhikr")) return "dhikr" as const;
  if (pathname.startsWith("/quran")) return "quran" as const;
  if (pathname.startsWith("/radio")) return "radio" as const;
  return "home" as const;
};

const AnalyticsPageView = () => {
  const location = useLocation();

  useEffect(() => {
    const route = applySeoRoute(location.pathname);
    trackEvent("page_view", {
      page_path: `${location.pathname}${location.search}`,
      page_title: route.title,
    });
    const section = getSectionFromPath(location.pathname);
    if (section) recordAtharSectionVisit(section);
  }, [location.pathname, location.search]);

  return null;
};

const AppShell = () => {
  const section = useActiveSection();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  useEffect(() => {
    if (isAdminRoute) return;
    const decision = runAtharBrain();
    trackEvent("athar_brain_decision", {
      state: decision.state,
      score: decision.score,
      time_band: decision.entry.timeBand,
      visit_count: decision.entry.visitCount,
    });
  }, [isAdminRoute]);

  useEffect(() => {
    if (isAdminRoute) return;
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
  }, [isAdminRoute]);

  if (isAdminRoute) {
    return (
      <div className="admin-shell">
        <main className="admin-scroll">
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/admin/athar" element={<AdminAnalyticsPage />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    );
  }

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
            <Route path="/" element={withRouteShell(<HomePage />)} />
            <Route path="/dhikr" element={withRouteShell(<DhikrPage />)} />
            <Route path="/quran" element={withRouteShell(<QuranPage />)} />
            <Route path="/radio" element={withRouteShell(<RadioPage />)} />
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
