"use client";

import { useState, useEffect, useCallback } from "react";
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
    } else {
      setError(true);
    }
    setLoading(false);
  }, []);

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

  useEffect(() => {
    if (!nextPrayer) return;
    const interval = setInterval(async () => {
      if (coords) {
        const data = await fetchPrayerTimes(coords.lat, coords.lng);
        if (data) {
          setTimeRemaining(data.timeRemaining);
        }
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [nextPrayer, coords]);

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
      <div className="athar-card">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={requestLocation}
            className="flex items-center gap-1 text-sm text-athar-primary hover:underline"
          >
            <MapPin className="w-4 h-4" />
            {location}
          </button>
          <div className="flex items-center gap-2">
            {hijri && (
              <span className="text-xs text-athar-muted">{hijri.weekday}</span>
            )}
            <span className="text-sm font-medium">مواقيت الصلاة</span>
          </div>
        </div>

        {/* التاريخ الهجري والأحداث */}
        {hijri && (
          <div className="mb-4 text-center">
            <p className="text-sm text-athar-primary font-medium">
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
          <div className="mt-4 p-4 bg-athar-bg rounded-xl text-center">
            <p className="text-sm text-athar-muted mb-1">
              الصلاة القادمة: {nextPrayer.name}
            </p>
            <div className="flex items-center justify-center gap-2 text-athar-primary">
              <Clock className="w-5 h-5" />
              <span className="text-2xl font-bold">{timeRemaining}</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
