"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MapPin, Clock, Loader2, AlertCircle, CheckCircle, BookOpen, X } from "lucide-react";
import { fetchPrayerTimes, fetchCityName, getIslamicEvents } from "@/lib/api";
import type { PrayerTimesData, HijriDate, IslamicEvent } from "@/lib/api";
import Badge from "./Badge";
import PrayerChip from "./PrayerChip";

function formatTime12(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const period = h < 12 ? "ص" : "م";
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

// ============================================================
// أذكار ما بعد الصلاة (مكتبة داخلية)
// ============================================================
const postPrayerAdhkar: Record<string, string[]> = {
  الفجر: [
    "أستغفر الله (3 مرات)",
    "اللهم أنت السلام ومنك السلام تباركت يا ذا الجلال والإكرام",
    "لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير (10 مرات)",
  ],
  الظهر: [
    "أستغفر الله (3 مرات)",
    "اللهم أنت السلام ومنك السلام تباركت يا ذا الجلال والإكرام",
    "لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير (مرة)",
  ],
  العصر: [
    "أستغفر الله (3 مرات)",
    "اللهم أنت السلام ومنك السلام تباركت يا ذا الجلال والإكرام",
    "لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير (مرة)",
  ],
  المغرب: [
    "أستغفر الله (3 مرات)",
    "اللهم أنت السلام ومنك السلام تباركت يا ذا الجلال والإكرام",
    "اللهم أجرني من النار (7 مرات)",
  ],
  العشاء: [
    "أستغفر الله (3 مرات)",
    "اللهم أنت السلام ومنك السلام تباركت يا ذا الجلال والإكرام",
    "آية الكرسي",
  ],
};

export default function PrayerTimes() {
  const [location, setLocation] = useState<string>("مكة المكرمة");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesData[]>([]);
  const [hijri, setHijri] = useState<HijriDate | null>(null);
  const [events, setEvents] = useState<IslamicEvent[]>([]);
  const [nextPrayer, setNextPrayer] = useState<PrayerTimesData | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("--:--:--");
  const [isIqamah, setIsIqamah] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // حالات جديدة للأزرار التفاعلية
  const [recordedPrayers, setRecordedPrayers] = useState<Set<string>>(new Set());
  const [showAdhkarModal, setShowAdhkarModal] = useState(false);
  const [selectedPrayerAdhkar, setSelectedPrayerAdhkar] = useState<string[]>([]);
  const [selectedPrayerName, setSelectedPrayerName] = useState("");

  const athanTimeRef = useRef<number | null>(null);
  const iqamahTimeRef = useRef<number | null>(null);
  const duhaEndRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // تحميل الأذكار المحفوظة من localStorage عند بدء التشغيل
  useEffect(() => {
    const saved = localStorage.getItem("athar-recorded-prayers");
    if (saved) {
      setRecordedPrayers(new Set(JSON.parse(saved)));
    }
  }, []);

  // دالة لتسجيل الصلاة وزيادة شجرة الأثر
  const recordPrayer = (prayerName: string) => {
    if (recordedPrayers.has(prayerName)) {
      // تم التسجيل مسبقاً
      alert(`سبق أن سجلت صلاة ${prayerName} اليوم`);
      return;
    }

    // تحديث الحالة المحلية
    const newSet = new Set(recordedPrayers);
    newSet.add(prayerName);
    setRecordedPrayers(newSet);
    localStorage.setItem("athar-recorded-prayers", JSON.stringify(Array.from(newSet)));

    // زيادة شجرة الأثر (التكامل مع TreeCard)
    const currentTreeCount = localStorage.getItem("athar-tree-completed");
    const newCount = currentTreeCount ? parseInt(currentTreeCount) + 1 : 1;
    localStorage.setItem("athar-tree-completed", newCount.toString());

    // إظهار رسالة نجاح
    alert(`✨ سُجلت صلاة ${prayerName} وأضيفت ورقة جديدة لشجرتك!`);
  };

  // فتح نافذة الأذكار
  const openAdhkar = (prayerName: string) => {
    const adhkar = postPrayerAdhkar[prayerName] || postPrayerAdhkar["الظهر"];
    setSelectedPrayerAdhkar(adhkar);
    setSelectedPrayerName(prayerName);
    setShowAdhkarModal(true);
  };

  const loadPrayerTimes = useCallback(async (lat: number, lng: number) => {
    setLoading(true);
    setError(false);
    const data = await fetchPrayerTimes(lat, lng);
    if (data) {
      setPrayerTimes(data.times);
      setHijri(data.hijri);
      const islamicEvents = getIslamicEvents(data.hijri, new Date());
      setEvents(islamicEvents);

      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      let upcomingPrayer = data.times[0];
      for (const prayer of data.times) {
        const [h, m] = prayer.time.split(":").map(Number);
        const prayerMinutes = h * 60 + m;
        if (prayerMinutes > currentTime) {
          upcomingPrayer = prayer;
          break;
        }
      }
      if (!upcomingPrayer) upcomingPrayer = data.times[0];

      setNextPrayer(upcomingPrayer);

      const [ah, am] = upcomingPrayer.time.split(":").map(Number);
      athanTimeRef.current = ah * 60 + am;

      if (upcomingPrayer.name === "الضحى") {
        const dhuhrPrayer = data.times.find((p) => p.name === "الظهر");
        if (dhuhrPrayer) {
          const [dhH, dhM] = dhuhrPrayer.time.split(":").map(Number);
          duhaEndRef.current = dhH * 60 + dhM - 10;
        } else {
          duhaEndRef.current = athanTimeRef.current + 60;
        }
        iqamahTimeRef.current = null;
      } else {
        duhaEndRef.current = null;
        if (upcomingPrayer.iqamah) {
          const [ih, im] = upcomingPrayer.iqamah.split(":").map(Number);
          iqamahTimeRef.current = ih * 60 + im;
        } else {
          iqamahTimeRef.current = null;
        }
      }

      if (upcomingPrayer.name === "الضحى") {
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        if (currentMinutes >= athanTimeRef.current && duhaEndRef.current && currentMinutes < duhaEndRef.current) {
          setIsIqamah(true);
        } else {
          setIsIqamah(false);
        }
      } else {
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        setIsIqamah(
          iqamahTimeRef.current !== null &&
          currentMinutes >= athanTimeRef.current &&
          currentMinutes < iqamahTimeRef.current
        );
      }
    } else {
      setError(true);
    }
    setLoading(false);
  }, []);

  const updateCityName = useCallback(async (lat: number, lng: number) => {
    const cityName = await fetchCityName(lat, lng);
    setLocation(cityName);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setCoords({ lat: latitude, lng: longitude });
          updateCityName(latitude, longitude);
          loadPrayerTimes(latitude, longitude);
        },
        () => {
          loadPrayerTimes(21.4225, 39.8262);
        }
      );
    } else {
      loadPrayerTimes(21.4225, 39.8262);
    }
  }, [loadPrayerTimes, updateCityName]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (athanTimeRef.current === null) return;

    intervalRef.current = setInterval(() => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const currentSeconds = now.getSeconds();
      const currentTotalSeconds = currentMinutes * 60 + currentSeconds;

      let targetMinutes: number | null = null;
      let phaseLabel: "athan" | "iqamah" | "duha" = "athan";

      if (nextPrayer?.name === "الضحى") {
        if (currentMinutes >= athanTimeRef.current! && duhaEndRef.current && currentMinutes < duhaEndRef.current) {
          targetMinutes = duhaEndRef.current;
          phaseLabel = "duha";
        } else if (currentMinutes < athanTimeRef.current!) {
          targetMinutes = athanTimeRef.current;
          phaseLabel = "athan";
        } else {
          if (coords) loadPrayerTimes(coords.lat, coords.lng);
          else loadPrayerTimes(21.4225, 39.8262);
          return;
        }
        setIsIqamah(phaseLabel === "duha");
      } else {
        const iqamah = iqamahTimeRef.current;
        if (iqamah !== null && currentMinutes >= athanTimeRef.current! && currentMinutes < iqamah) {
          targetMinutes = iqamah;
          phaseLabel = "iqamah";
        } else {
          targetMinutes = athanTimeRef.current!;
          if (targetMinutes <= currentMinutes) targetMinutes += 24 * 60;
          phaseLabel = "athan";
        }
        setIsIqamah(phaseLabel === "iqamah");
      }

      if (targetMinutes === null) return;

      const remainingSeconds = (targetMinutes * 60) - currentTotalSeconds;
      if (remainingSeconds <= 0) {
        if (coords) loadPrayerTimes(coords.lat, coords.lng);
        else loadPrayerTimes(21.4225, 39.8262);
        return;
      }

      const hours = Math.floor(remainingSeconds / 3600);
      const mins = Math.floor((remainingSeconds % 3600) / 60);
      const secs = remainingSeconds % 60;
      setTimeRemaining(
        `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
      );
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [coords, loadPrayerTimes, nextPrayer]);

  useEffect(() => {
    const apiInterval = setInterval(() => {
      if (coords) loadPrayerTimes(coords.lat, coords.lng);
      else loadPrayerTimes(21.4225, 39.8262);
    }, 300000);
    return () => clearInterval(apiInterval);
  }, [coords, loadPrayerTimes]);

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setCoords({ lat: latitude, lng: longitude });
          updateCityName(latitude, longitude);
          loadPrayerTimes(latitude, longitude);
        },
        () => alert("لم نتمكن من الوصول لموقعك. جاري استخدام مكة المكرمة.")
      );
    }
  };

  const mainPrayers = prayerTimes.filter((p) => !["الشروق", "الضحى"].includes(p.name));
  const supplementaryPrayers = prayerTimes.filter((p) => ["الشروق", "الضحى"].includes(p.name));

  return (
    <>
      <section className="px-4 py-4">
        <div className="relative overflow-hidden bg-gradient-to-b from-athar-primary-100 via-athar-bg-100 to-athar-card dark:from-athar-primary-800 dark:via-gray-800 dark:to-gray-900 rounded-3xl shadow-lg border border-athar-primary-200/40 dark:border-athar-primary-700/30 p-5 space-y-4 backdrop-blur-sm">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-athar-primary-400 to-transparent opacity-80"></div>

          <div className="flex items-center justify-between">
            <button
              onClick={requestLocation}
              className="flex items-center gap-1 text-sm text-athar-primary-600 dark:text-athar-accent-400 hover:underline transition-colors"
            >
              <MapPin className="w-4 h-4" />
              {location}
            </button>
            <div className="flex items-center gap-2">
              {hijri && (
                <span className="text-xs text-athar-primary-400 dark:text-gray-400">{hijri.weekday}</span>
              )}
              <span className="text-sm font-medium text-athar-primary-700 dark:text-gray-200">مواقيت الصلاة</span>
            </div>
          </div>

          {hijri && (
            <div className="text-center">
              <p className="text-sm text-athar-primary-600 dark:text-athar-accent-400 font-medium">
                {hijri.day} {hijri.month} {hijri.year} هـ
              </p>
              {events.length > 0 && (
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  {events.map((event) => (
                    <Badge key={event.name} label={event.name} variant="accent" />
                  ))}
                </div>
              )}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-6 h-6 text-athar-primary-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center gap-2 py-6 text-red-500">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">تعذر جلب مواقيت الصلاة</span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* الصلوات الخمس الأساسية مع أزرار تفاعلية */}
              <div className="space-y-3">
                {mainPrayers.map((prayer) => {
                  const isRecorded = recordedPrayers.has(prayer.name);
                  return (
                    <div key={prayer.name} className="flex items-center justify-between gap-2">
                      <PrayerChip
                        name={prayer.name}
                        time={prayer.time}
                        icon={prayer.icon}
                        isActive={nextPrayer?.name === prayer.name}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => recordPrayer(prayer.name)}
                          className={`p-2 rounded-full transition-all active:scale-95 touch-manipulation ${
                            isRecorded
                              ? "bg-athar-primary-100 text-athar-primary-600 dark:bg-gray-700 dark:text-athar-accent-400"
                              : "bg-athar-accent-100 text-athar-accent-600 hover:bg-athar-accent-200"
                          }`}
                          style={{ minWidth: "40px", minHeight: "40px" }}
                          title={isRecorded ? "سُجلت سابقاً" : "سجل صلاتي"}
                        >
                          {isRecorded ? <CheckCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5 opacity-60" />}
                        </button>
                        <button
                          onClick={() => openAdhkar(prayer.name)}
                          className="p-2 rounded-full bg-athar-primary-100 text-athar-primary-600 dark:bg-gray-700 dark:text-athar-accent-400 hover:bg-athar-primary-200 transition-all active:scale-95 touch-manipulation"
                          style={{ minWidth: "40px", minHeight: "40px" }}
                          title="أذكار ما بعد الصلاة"
                        >
                          <BookOpen className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* الأوقات المكملة */}
              {supplementaryPrayers.length > 0 && (
                <div className="flex justify-center gap-3">
                  {supplementaryPrayers.map((prayer) => (
                    <PrayerChip
                      key={prayer.name}
                      name={prayer.name}
                      time={prayer.time}
                      icon={prayer.icon}
                      isActive={nextPrayer?.name === prayer.name}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* العداد الذكي */}
          {nextPrayer && (
            <div className="p-4 bg-athar-primary-200/60 dark:bg-athar-primary-900/30 rounded-2xl text-center shadow-inner border border-athar-primary-300/30 dark:border-athar-primary-700/20">
              <p className="text-sm text-athar-primary-600 dark:text-gray-400 mb-1">
                {nextPrayer.name === "الضحى"
                  ? isIqamah
                    ? "وقت الضحى ممتد"
                    : "الصلاة القادمة: الضحى"
                  : isIqamah
                  ? `الإقامة: ${nextPrayer.name}`
                  : `الصلاة القادمة: ${nextPrayer.name}`}
              </p>
              <div className="flex items-center justify-center gap-2 text-athar-primary-700 dark:text-athar-accent-400">
                <Clock className="w-5 h-5" />
                <span className="text-3xl font-bold tabular-nums tracking-wider">{timeRemaining}</span>
              </div>
              {nextPrayer.name !== "الضحى" && nextPrayer.iqamah && (
                <p className="text-xs text-athar-primary-500 dark:text-gray-500 mt-1">
                  وقت الإقامة: {formatTime12(nextPrayer.iqamah)}
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* مودال عرض أذكار ما بعد الصلاة */}
      {showAdhkarModal && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl animate-scale-up relative">
            <button
              onClick={() => setShowAdhkarModal(false)}
              className="absolute top-4 left-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
            <h3 className="text-lg font-bold text-athar-text dark:text-gray-200">
              أذكار ما بعد صلاة {selectedPrayerName}
            </h3>
            <div className="bg-athar-bg-100 dark:bg-gray-800 rounded-2xl p-4 text-right space-y-2">
              {selectedPrayerAdhkar.map((dhikr, idx) => (
                <p key={idx} className="text-sm text-athar-text dark:text-gray-300 leading-relaxed">
                  • {dhikr}
                </p>
              ))}
            </div>
            <button
              onClick={() => setShowAdhkarModal(false)}
              className="w-full py-2 text-sm text-athar-text-muted dark:text-gray-400 hover:text-athar-text dark:hover:text-gray-200 transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </>
  );
}
