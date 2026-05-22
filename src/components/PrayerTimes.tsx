"use client";

import { useState, useEffect } from "react";
import { MapPin, Clock } from "lucide-react";

const prayerNames = [
  { name: "الفجر", icon: "🌅" },
  { name: "الشروق", icon: "🌇" },
  { name: "الظهر", icon: "☀️" },
  { name: "العصر", icon: "🌤️" },
  { name: "المغرب", icon: "🌆" },
  { name: "العشاء", icon: "🌙" },
];

export default function PrayerTimes() {
  const [location, setLocation] = useState<string>("مكة المكرمة");
  const [prayerTimes, setPrayerTimes] = useState<string[]>([
    "04:07",
    "05:38",
    "12:25",
    "15:53",
    "19:12",
    "20:42",
  ]);
  const [nextPrayer, setNextPrayer] = useState({ name: "المغرب", time: "19:12" });
  const [timeRemaining, setTimeRemaining] = useState("03:01:11");

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // TODO: Call API with lat/lon
          setLocation("الموقع الحالي");
        },
        () => {
          alert("لم نتمكن من الوصول لموقعك. جاري استخدام مكة المكرمة.");
        }
      );
    }
  };

  return (
    <section className="px-4 py-4">
      <div className="athar-card">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={requestLocation}
            className="flex items-center gap-1 text-sm text-athar-primary"
          >
            <MapPin className="w-4 h-4" />
            {location}
          </button>
          <span className="text-sm font-medium">مواقيت الصلاة</span>
        </div>

        {/* Prayer Times List */}
        <div className="space-y-2">
          {prayerNames.map((prayer, index) => (
            <div
              key={prayer.name}
              className={`flex items-center justify-between p-2 rounded-lg ${
                prayer.name === nextPrayer.name
                  ? "bg-athar-primary/10 text-athar-primary"
                  : "text-athar-text"
              }`}
            >
              <span className="text-sm">{prayerTimes[index]}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{prayer.name}</span>
                <span>{prayer.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Next Prayer */}
        <div className="mt-4 p-4 bg-athar-bg rounded-xl text-center">
          <p className="text-sm text-athar-muted mb-1">الصلاة القادمة: {nextPrayer.name}</p>
          <div className="flex items-center justify-center gap-2 text-athar-primary">
            <Clock className="w-5 h-5" />
            <span className="text-2xl font-bold">{timeRemaining}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
