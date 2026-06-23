import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import BottomNav from "./components/Navigation/BottomNav";
import HomePage from "./pages/HomePage";
import DhikrPage from "./pages/DhikrPage";
import QuranPage from "./pages/QuranPage";
import PageTransition from "./components/Shared/PageTransition";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen w-full bg-primary-bg font-arabic flex flex-col">
        <div className="flex-1 w-full max-w-md mx-auto px-4 pb-28 pt-4">
          <Routes>
            <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
            <Route path="/dhikr" element={<PageTransition><DhikrPage /></PageTransition>} />
            <Route path="/quran" element={<PageTransition><QuranPage /></PageTransition>} />
          </Routes>
        </div>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}
