import { useEffect, useState } from "react";
import { useGeolocation } from "../../hooks/useGeolocation";
import { getPrayerTimes } from "../../services/prayerApi";

const IQAMAH_OFFSET: Record<string, number> = {
  Fajr: 20,
  Dhuhr: 15,
  Asr: 15,
  Maghrib: 15,
  Isha: 15,
};

export default function PrayerTimes() {
  const { location } = useGeolocation();
  const [timings, setTimings] = useState<Record<string, string> | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: Date } | null>(null);
  const [countdown, setCountdown] = useState<string>("--:--");

  useEffect(() => {
    if (!location) return;
    getPrayerTimes(location.lat, location.lng).then(setTimings);
  }, [location]);

  useEffect(() => {
    if (!timings) return;
    const now = new Date();
    const prayerNames = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
    const prayerTimes = prayerNames.map((name) => {
      const [h, m] = timings[name].split(":").map(Number);
      const d = new Date(now);
      d.setHours(h, m, 0, 0);
      return { name, time: d };
    });
    const iqamahTimes = prayerTimes.map((p) => {
      const iqamah = new Date(p.time);
      iqamah.setMinutes(iqamah.getMinutes() + (IQAMAH_OFFSET[p.name] || 15));
      return { ...p, iqamah };
    });
    const next = iqamahTimes.find((p) => p.iqamah > now) || iqamahTimes[0];
    setNextPrayer({ name: next.name, time: next.iqamah });
  }, [timings]);

  useEffect(() => {
    if (!nextPrayer) return;
    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.max(0, Math.floor((nextPrayer.time.getTime() - now.getTime()) / 1000));
      const mins = Math.floor(diff / 60);
      const secs = diff % 60;
      setCountdown(`${mins}:${secs.toString().padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [nextPrayer]);

  if (!timings || !nextPrayer) {
    return <div className="bg-card-bg rounded-card p-4 shadow-lg text-center text-secondary-text">جاري التحميل...</div>;
  }

  return (
    <div className="bg-card-bg rounded-card p-4 shadow-lg">
      <p className="text-sm text-secondary-text">الصلاة القادمة</p>
      <p className="text-xl font-bold text-primary-text">{nextPrayer.name}</p>
      <p className="text-3xl font-bold text-action text-center mt-2">{countdown}</p>
      <p className="text-xs text-secondary-text text-center mt-1">متبقي حتى الإقامة</p>
    </div>
  );
}
