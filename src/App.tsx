import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import BottomNav from "./components/Navigation/BottomNav";
import HomePage from "./pages/HomePage";
import DhikrPage from "./pages/DhikrPage";
import QuranPage from "./pages/QuranPage";
import RadioPage from "./pages/RadioPage";
import PageTransition from "./components/Shared/PageTransition";
import ErrorBoundary from "./components/Shared/ErrorBoundary";
import InstallPrompt from "./components/Shared/InstallPrompt";

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="min-h-screen w-full bg-primary-bg font-arabic flex flex-col">
          <InstallPrompt />
          <div className="flex-1 w-full max-w-md mx-auto px-4 pb-28 pt-16">
            <Routes>
              <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
              <Route path="/dhikr" element={<PageTransition><DhikrPage /></PageTransition>} />
              <Route path="/quran" element={<PageTransition><QuranPage /></PageTransition>} />
              <Route path="/radio" element={<PageTransition><RadioPage /></PageTransition>} />
            </Routes>
          </div>
          <BottomNav />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
