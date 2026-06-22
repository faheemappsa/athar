import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import BottomNav from "./components/Navigation/BottomNav";
import HomePage from "./pages/HomePage";
import DhikrPage from "./pages/DhikrPage";
import QuranPage from "./pages/QuranPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-b from-[#E8EDF2] to-white font-arabic pb-20">
        <div className="max-w-md mx-auto p-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dhikr" element={<DhikrPage />} />
            <Route path="/quran" element={<QuranPage />} />
          </Routes>
        </div>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}
