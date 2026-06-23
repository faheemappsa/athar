import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
    getPrayerTimes(location.lat, location.lng).then(setTimings).catch(() => {});
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
    return (
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="w-full rounded-card bg-white p-6 text-center text-secondary-text shadow-xl"
      >
        جاري التحميل...
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="relative w-full overflow-hidden rounded-card bg-white p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
    >
      <div className="absolute -left-12 -top-12 h-28 w-28 rounded-full bg-mint-soft" />
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-secondary-text">الصلاة القادمة</p>
          <p className="mt-1 text-2xl font-bold text-primary-text">{nextPrayer.name}</p>
        </div>
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[20px] bg-mint-soft text-xl text-action">☾</div>
      </div>
      <p className="relative z-10 mt-5 text-center text-5xl font-bold tracking-tight text-action">{countdown}</p>
      <p className="relative z-10 mt-2 text-center text-sm text-secondary-text">متبقي حتى الإقامة</p>
    </motion.div>
  );
}
