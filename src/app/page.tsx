"use client";

import { useState, useEffect } from "react";
import { Moon, Heart, Settings, Share2, Bookmark, RefreshCw, MessageCircle } from "lucide-react";
import { WHATSAPP_LINK } from "@/lib/constants";
import { trackSupportClick, trackAtharView } from "@/lib/analytics";
import AtharCard from "@/components/AtharCard";
import PrayerTimes from "@/components/PrayerTimes";
import Streak from "@/components/Streak";

export default function Home() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("athar-streak");
    if (saved) setStreak(parseInt(saved));
    
    // Track page view
    trackAtharView("daily", "home");
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleSupportClick = () => {
    trackSupportClick();
    window.open(WHATSAPP_LINK, "_blank");
  };

  return (
    <main className="min-h-screen pb-24">
      {/* Header */}
      <header className="flex items-center justify-between p-4">
        <button className="p-2 rounded-full bg-white/80 shadow-sm">
          <Moon className="w-5 h-5 text-athar-primary" />
        </button>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-athar-primary">أثر</h1>
          <p className="text-xs text-athar-muted">كل يوم أثر نور</p>
        </div>
        <button className="p-2 rounded-full bg-white/80 shadow-sm">
          <Heart className="w-5 h-5 text-athar-primary" />
        </button>
      </header>

      {/* Dua */}
      <section className="px-4 py-2 text-center">
        <p className="text-athar-text font-medium">اللهم لا تُخْلِفْ لنا وعدك</p>
        <p className="text-athar-muted text-sm">اللهم بك أصبحنا وبك أمسينا</p>
      </section>

      {/* Athar Card */}
      <AtharCard />

      {/* Prayer Times */}
      <PrayerTimes />

      {/* Streak */}
      <Streak streak={streak} />

      {/* WhatsApp Support Button */}
      <section className="px-4 py-4">
        <button
          onClick={handleSupportClick}
          className="w-full flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-xl font-medium transition-all hover:bg-green-600 active:scale-95"
        >
          <MessageCircle className="w-5 h-5" />
          تواصل معنا عبر واتساب
        </button>
      </section>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-around items-center">
        <button className="flex flex-col items-center gap-1 text-athar-primary">
          <span className="text-xs font-medium">الرئيسية</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-gray-400">
          <span className="text-xs font-medium">أذكار</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-gray-400">
          <span className="text-xs font-medium">سجلي</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-gray-400">
          <span className="text-xs font-medium">المزيد</span>
        </button>
      </nav>
    </main>
  );
}
