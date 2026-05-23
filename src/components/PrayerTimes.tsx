"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MapPin, Clock, Loader2, AlertCircle } from "lucide-react";
import { fetchPrayerTimes, getIslamicEvents } from "@/lib/api";
import type { PrayerTimesData, HijriDate, IslamicEvent } from "@/lib/api";
import Badge from "./Badge";
import PrayerChip from "./PrayerChip";

export default function PrayerTimes() {
  const [location, setLocation] = useState<string>("مكة المكرمة");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesData[]>([]);
  const [hijri, setHijri] = useState<HijriDate | null>(null);
  const [events, setEvents] = useState<IslamicEvent[]>([]);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string } | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("--:--:--");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // مرجع لحفظ وقت الصلاة القادمة بالدقائق لتجنب استدعاء API كل ثانية
  const nextPrayerTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadPrayerTimes = useCallback(async (lat: number, lng: number) => {
    setLoading(true);
    setError(false);
    const data = await fetchPrayerTimes(lat, lng);
    if (data) {
      setPrayerTimes(data.times);
      setHijri(data.hijri);
      setNextPrayer(data.nextPrayer);
      setTimeRemaining(data.timeRemaining);
      const islamicEvents = getIslamicEvents(data.hijri, new Date());
      setEvents(islamicEvents);
      
      // حفظ وقت الصلاة القادمة بالدقائق من منتصف الليل للاستخدام المحلي
      const [h, m] = data.nextPrayer.time.split(":").map(Number);
      nextPrayerTimeRef.current = h * 60 + m;
    } else {
      setError(true);
    }
    setLoading(false);
  }, []);

  // جلب البيانات أول مرة
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setCoords({ lat: latitude, lng: longitude });
          setLocation("موقعي الحالي");
          loadPrayerTimes(latitude, longitude);
        },
        () => {
          loadPrayerTimes(21.4225, 39.8262);
        }
      );
    } else {
      loadPrayerTimes(21.4225, 39.8262);
    }
  }, [loadPrayerTimes]);

  // عداد حي بالثواني
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    if (nextPrayerTimeRef.current === null) return;

    intervalRef.current = setInterval(() => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const currentSeconds = now.getSeconds();
      
      let diffMinutes = nextPrayerTimeRef.current! - currentMinutes;
      if (diffMinutes <= 0) diffMinutes += 24 * 60; // اليوم التالي
      
      const remainingSeconds = (diffMinutes * 60) - currentSeconds;
      if (remainingSeconds <= 0) {
        // حان وقت الصلاة، نجيب البيانات من جديد
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
  }, [nextPrayerTimeRef.current, coords, loadPrayerTimes]);

  // تحديث البيانات من API كل 5 دقائق
  useEffect(() => {
    const apiInterval = setInterval(() => {
      if (coords) loadPrayerTimes(coords.lat, coords.lng);
      else loadPrayerTimes(21.4225, 39.8262);
    }, 300000); // 5 دقائق

    return () => clearInterval(apiInterval);
  }, [coords, loadPrayerTimes]);

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setCoords({ lat: latitude, lng: longitude });
          setLocation("موقعي الحالي");
          loadPrayerTimes(latitude, longitude);
        },
        () => alert("لم نتمكن من الوصول لموقعك. جاري استخدام مكة المكرمة.")
      );
    }
  };

  return (
    <section className="px-4 py-4">
      <div className="bg-athar-bg dark:bg-gray-800/80 rounded-2xl shadow-md ring-1 ring-athar-primary/10 dark:ring-gray-700 p-5 space-y-4">
        {/* Header */}
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

        {/* التاريخ الهجري والأحداث */}
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

        {/* قائمة مواقيت الصلاة أفقية */}
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
          <div className="flex gap-2 overflow-x-auto pb-2">
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

        {/* الصلاة القادمة والوقت المتبقي */}
        {nextPrayer && (
          <div className="p-4 bg-white dark:bg-gray-900/50 rounded-xl text-center shadow-sm">
            <p className="text-sm text-athar-muted dark:text-gray-400 mb-1">
              الصلاة القادمة: {nextPrayer.name}
            </p>
            <div className="flex items-center justify-center gap-2 text-athar-primary dark:text-athar-accent">
              <Clock className="w-5 h-5" />
              <span className="text-2xl font-bold tabular-nums">{timeRemaining}</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
