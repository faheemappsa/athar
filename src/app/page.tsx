"use client";

import { useState, useEffect } from "react";
import { Moon, Heart, MessageCircle } from "lucide-react";
import { WHATSAPP_LINK } from "@/lib/constants";
import { trackSupportClick, trackAtharView } from "@/lib/analytics";
import AtharCard from "@/components/AtharCard";
import PrayerTimes from "@/components/PrayerTimes";
import Streak from "@/components/Streak";
import BottomNav from "@/components/BottomNav";

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
    trackAtharView("daily", "home");
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered:", registration.scope);
        })
        .catch((error) => {
          console.log("SW registration failed:", error);
        });
    }
  }, []);

  const handleSupportClick = () => {
    trackSupportClick();
    window.open(WHATSAPP_LINK, "_blank");
  };

  return (
    <main className="min-h-screen pb-28">
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

      {/* Dua Strip */}
      <section className="px-4 py-2">
        <div className="bg-athar-primary/5 rounded-2xl px-4 py-3 text-center">
          <p className="text-sm font-medium text-athar-text">اللهم لا تُخْلِفْ لنا وعدك</p>
          <p className="text-xs text-athar-muted mt-0.5">اللهم بك أصبحنا وبك أمسينا</p>
        </div>
      </section>

      {/* Athar Card */}
      <AtharCard />

      {/* Prayer Times */}
      <PrayerTimes />

      {/* Streak */}
      <Streak streak={streak} />

      {/* Waqf Card */}
      <section className="px-4 py-4">
        <div className="bg-athar-bg/50 backdrop-blur-sm rounded-2xl p-4 text-center border border-athar-primary/10">
          <p className="text-xs text-athar-muted leading-relaxed">
            هذا الأثر الجاري صدقة عن{" "}
            <span className="text-athar-primary font-medium">مسلم عوده البويني</span>{" "}
            رحمه الله
          </p>
          <button
            onClick={handleSupportClick}
            className="mt-2 text-sm text-athar-primary font-medium flex items-center justify-center gap-1 mx-auto hover:underline"
          >
            <MessageCircle className="w-4 h-4" />
            تواصل معنا
          </button>
        </div>
      </section>

      {/* Bottom Navigation */}
      <BottomNav />
    </main>
  );
}
