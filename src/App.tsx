import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import BottomNav from "./components/Navigation/BottomNav";
import PageTransition from "./components/Shared/PageTransition";
import HomePage from "./pages/HomePage";
import DhikrPage from "./pages/DhikrPage";
import QuranPage from "./pages/QuranPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-b from-[#E8EDF2] to-white font-arabic pb-20">
        <div className="max-w-md mx-auto p-4">
          <Routes>
            <Route
              path="/"
              element={
                <PageTransition>
                  <HomePage />
                </PageTransition>
              }
            />
            <Route
              path="/dhikr"
              element={
                <PageTransition>
                  <DhikrPage />
                </PageTransition>
              }
            />
            <Route
              path="/quran"
              element={
                <PageTransition>
                  <QuranPage />
                </PageTransition>
              }
            />
          </Routes>
        </div>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}
