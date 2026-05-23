"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MapPin, Clock, Loader2, AlertCircle } from "lucide-react";
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

  const athanTimeRef = useRef<number | null>(null);
  const iqamahTimeRef = useRef<number | null>(null);
  const duhaEndRef = useRef<number | null>(null); // للضحى فقط
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
        // وقت انتهاء الضحى = أذان الظهر - 10 دقائق
        const dhuhrPrayer = data.times.find((p) => p.name === "الظهر");
        if (dhuhrPrayer) {
          const [dhH, dhM] = dhuhrPrayer.time.split(":").map(Number);
          duhaEndRef.current = dhH * 60 + dhM - 10;
        } else {
          duhaEndRef.current = athanTimeRef.current + 60; // احتياطي ساعة
        }
        // الضحى ليس لها إقامة، نتعامل معها كوقت ممتد
        iqamahTimeRef.current = null; // لا إقامة
      } else {
        duhaEndRef.current = null;
        if (upcomingPrayer.iqamah) {
          const [ih, im] = upcomingPrayer.iqamah.split(":").map(Number);
          iqamahTimeRef.current = ih * 60 + im;
        } else {
          iqamahTimeRef.current = null;
        }
      }

      // تحديد المرحلة الحالية
      if (upcomingPrayer.name === "الضحى") {
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        if (currentMinutes >= athanTimeRef.current && duhaEndRef.current && currentMinutes < duhaEndRef.current) {
          setIsIqamah(true); // هنا تعني "وقت الضحى ممتد"
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

  // العداد الحي
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
        // منطق خاص بالضحى
        if (currentMinutes >= athanTimeRef.current! && duhaEndRef.current && currentMinutes < duhaEndRef.current) {
          // داخل وقت الضحى
          targetMinutes = duhaEndRef.current;
          phaseLabel = "duha";
        } else if (currentMinutes < athanTimeRef.current!) {
          // قبل بدء الضحى
          targetMinutes = athanTimeRef.current;
          phaseLabel = "athan";
        } else {
          // بعد انتهاء وقت الضحى -> انتقل للظهر (نعيد تحميل البيانات)
          if (coords) loadPrayerTimes(coords.lat, coords.lng);
          else loadPrayerTimes(21.4225, 39.8262);
          return;
        }
        setIsIqamah(phaseLabel === "duha");
      } else {
        // صلاة عادية
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
        // انتهى الوقت المستهدف، نحدث البيانات
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

  return (
    <section className="px-4 py-4">
      <div className="bg-athar-bg dark:bg-gray-800/80 rounded-2xl shadow-md ring-1 ring-athar-primary/10 dark:ring-gray-700 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={requestLocation}
            className="flex items-center gap-1 text-sm text-athar-primary dark:text-athar-accent hover:underline transition-colors"
          >
            <MapPin className="w-4 h-4" />
            {location}
          </button>
          <div className="flex items-center gap-2">
            {hijri && (
              <span className="text-xs text-athar-muted dark:text-gray-400">{hijri.weekday}</span>
            )}
            <span className="text-sm font-medium text-athar-text dark:text-gray-200">مواقيت الصلاة</span>
          </div>
        </div>

        {hijri && (
          <div className="text-center">
            <p className="text-sm text-athar-primary dark:text-athar-accent font-medium">
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
            <Loader2 className="w-6 h-6 text-athar-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center gap-2 py-6 text-red-500">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">تعذر جلب مواقيت الصلاة</span>
          </div>
        ) : (
          <div className="flex justify-between gap-0.5">
            {prayerTimes.map((prayer) => (
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

        {nextPrayer && (
          <div className="p-4 bg-white dark:bg-gray-900/50 rounded-xl text-center shadow-sm">
            <p className="text-sm text-athar-muted dark:text-gray-400 mb-1">
              {nextPrayer.name === "الضحى"
                ? isIqamah
                  ? "وقت الضحى ممتد"
                  : "الصلاة القادمة: الضحى"
                : isIqamah
                ? `الإقامة: ${nextPrayer.name}`
                : `الصلاة القادمة: ${nextPrayer.name}`}
            </p>
            <div className="flex items-center justify-center gap-2 text-athar-primary dark:text-athar-accent">
              <Clock className="w-5 h-5" />
              <span className="text-2xl font-bold tabular-nums">{timeRemaining}</span>
            </div>
            {nextPrayer.name !== "الضحى" && nextPrayer.iqamah && (
              <p className="text-xs text-athar-muted dark:text-gray-500 mt-1">
                وقت الإقامة: {formatTime12(nextPrayer.iqamah)}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
