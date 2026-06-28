import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { appMotion } from "../../config/motion";
import { useSavedLocation } from "../../hooks/useSavedLocation";
import { getPrayerTimes } from "../../services/prayerApi";
import { useSurfaceSignal } from "../../experience/useSurfaceSignal";

const IQAMAH_OFFSET: Record<string, number> = {
  Fajr: 20,
  Dhuhr: 15,
  Asr: 15,
  Maghrib: 15,
  Isha: 15,
};

const PRAYER_LABELS: Record<string, string> = {
  Fajr: "الفجر",
  Dhuhr: "الظهر",
  Asr: "العصر",
  Maghrib: "المغرب",
  Isha: "العشاء",
};

type PrayerRow = {
  name: string;
  adhan: Date;
  iqamah: Date;
};

type FaithOccasion = {
  title: string;
  hint: string;
};

const formatTime = (date: Date) =>
  new Intl.DateTimeFormat("ar-SA", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);

const formatCountdown = (secondsTotal: number) => {
  const hours = Math.floor(secondsTotal / 3600);
  const minutes = Math.floor((secondsTotal % 3600) / 60);
  const seconds = secondsTotal % 60;
  return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

const getHijriParts = () => {
  const parts = new Intl.DateTimeFormat("en-TN-u-ca-islamic-umalqura", {
    day: "numeric",
    month: "numeric",
  }).formatToParts(new Date());

  return {
    day: Number(parts.find((part) => part.type === "day")?.value || 0),
    month: Number(parts.find((part) => part.type === "month")?.value || 0),
  };
};

const getFaithOccasion = (): FaithOccasion | null => {
  const now = new Date();
  const { day, month } = getHijriParts();
  const isFriday = now.getDay() === 5;

  if (month === 9) {
    if (day >= 21) return { title: "🌙 العشر الأواخر", hint: "أكثر من الدعاء والقرآن" };
    return { title: "🌙 رمضان مبارك", hint: "أيام خير وبركة" };
  }

  if (month === 10 && day === 1) return { title: "🎉 عيد الفطر", hint: "تقبل الله طاعتكم" };

  if (month === 12) {
    if (day === 9) return { title: "🕋 يوم عرفة", hint: "اغتنم الدعاء" };
    if (day === 10) return { title: "🎉 عيد الأضحى", hint: "تقبل الله منكم" };
    if (day >= 1 && day <= 10) return { title: "🕋 عشر ذي الحجة", hint: "أيام عظيمة" };
  }

  if (month === 1 && day === 10) return { title: "🌙 عاشوراء", hint: "اغتنم الصيام والدعاء" };
  if ([13, 14, 15].includes(day)) return { title: "🤍 الأيام البيض", hint: "فرصة جميلة للصيام" };
  if (isFriday) return { title: "🕌 يوم الجمعة", hint: "أكثر من الصلاة على النبي ﷺ" };

  return null;
};

const getHijriDate = () => {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).formatToParts(now);

  const weekday = parts.find((part) => part.type === "weekday")?.value || "";
  const day = parts.find((part) => part.type === "day")?.value || "";
  const month = parts.find((part) => part.type === "month")?.value || "";
  const year = parts.find((part) => part.type === "year")?.value || "";

  return `${weekday}، ${day} ${month} ${year}`;
};

export default function PrayerTimes() {
  const { location, status, error, requestLocation, daysSinceUpdate, shouldRefresh } = useSavedLocation();
  const [timings, setTimings] = useState<Record<string, string> | null>(null);
  const [nextPrayer, setNextPrayer] = useState<PrayerRow | null>(null);
  const [currentIqamahPrayer, setCurrentIqamahPrayer] = useState<PrayerRow | null>(null);
  const [countdown, setCountdown] = useState<string>("0:00:00");
  const [iqamahCountdown, setIqamahCountdown] = useState<string>("0:00:00");
  const [loadError, setLoadError] = useState("");
  const surfaceMotion = appMotion.surface;
  const surfaceSignal = useSurfaceSignal<HTMLDivElement>({ surface: "prayer-card", contentId: nextPrayer?.name || "prayer-card", minFocusMs: 4000 });

  const hijriDate = useMemo(() => getHijriDate(), []);
  const faithOccasion = useMemo(() => getFaithOccasion(), []);

  const handleLocationRequest = () => {
    surfaceSignal.recordClick();
    requestLocation();
  };

  useEffect(() => {
    if (!location) return;
    setLoadError("");
    getPrayerTimes(location.lat, location.lng)
      .then(setTimings)
      .catch(() => setLoadError("تعذر تحميل مواقيت الصلاة"));
  }, [location]);

  const prayerRows = useMemo<PrayerRow[]>(() => {
    if (!timings) return [];
    const now = new Date();
    return ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].map((name) => {
      const [h, m] = timings[name].split(":").map(Number);
      const adhan = new Date(now);
      adhan.setHours(h, m, 0, 0);
      const iqamah = new Date(adhan);
      iqamah.setMinutes(iqamah.getMinutes() + (IQAMAH_OFFSET[name] || 15));
      return { name, adhan, iqamah };
    });
  }, [timings]);

  useEffect(() => {
    if (prayerRows.length === 0) return;

    const getTomorrowPrayer = (prayer: PrayerRow) => ({
      ...prayer,
      adhan: new Date(prayer.adhan.getTime() + 24 * 60 * 60 * 1000),
      iqamah: new Date(prayer.iqamah.getTime() + 24 * 60 * 60 * 1000),
    });

    const updatePrayerState = () => {
      const now = new Date();
      const currentIqamah = prayerRows.find((prayer) => prayer.adhan <= now && prayer.iqamah > now) || null;
      const todayNextAdhan = prayerRows.find((prayer) => prayer.adhan > now);
      const nextAdhan = todayNextAdhan || getTomorrowPrayer(prayerRows[0]);

      setNextPrayer(nextAdhan);
      setCurrentIqamahPrayer(currentIqamah);
      setCountdown(formatCountdown(Math.max(0, Math.floor((nextAdhan.adhan.getTime() - now.getTime()) / 1000))));

      if (currentIqamah) {
        setIqamahCountdown(formatCountdown(Math.max(0, Math.floor((currentIqamah.iqamah.getTime() - now.getTime()) / 1000))));
      } else {
        setIqamahCountdown("0:00:00");
      }
    };

    updatePrayerState();
    const interval = setInterval(updatePrayerState, 1000);
    return () => clearInterval(interval);
  }, [prayerRows]);

  if (!location) {
    return (
      <motion.div
        ref={surfaceSignal.ref}
        initial={surfaceMotion.initial}
        animate={surfaceMotion.animate}
        transition={surfaceMotion.transition}
        className="w-full rounded-card bg-white p-6 text-center shadow-xl"
      >
        <p className="text-lg font-bold text-primary-text">مواقيت الصلاة</p>
        <p className="mt-2 text-sm leading-relaxed text-secondary-text">حدد موقعك مرة واحدة لنحفظ المواقيت بدقة.</p>
        <button
          onClick={handleLocationRequest}
          disabled={status === "loading"}
          className="mt-5 rounded-full bg-action px-6 py-3 font-bold text-white shadow-md disabled:opacity-70"
          aria-label="تحديد موقعي لحساب مواقيت الصلاة"
        >
          {status === "loading" ? "جاري التحديد..." : "تحديد موقعي"}
        </button>
        {error && <p className="mt-3 text-xs text-secondary-text">{error}</p>}
      </motion.div>
    );
  }

  if (!timings || !nextPrayer) {
    return (
      <motion.div
        ref={surfaceSignal.ref}
        initial={surfaceMotion.initial}
        animate={surfaceMotion.animate}
        transition={surfaceMotion.transition}
        className="w-full rounded-card bg-white p-6 text-center text-secondary-text shadow-xl"
      >
        {loadError || "جاري تحميل المواقيت..."}
      </motion.div>
    );
  }

  const activePrayerName = currentIqamahPrayer?.name || nextPrayer.name;

  return (
    <motion.div
      ref={surfaceSignal.ref}
      initial={surfaceMotion.initial}
      animate={surfaceMotion.animate}
      transition={surfaceMotion.transition}
      className="relative w-full overflow-hidden rounded-card bg-white p-6 shadow-xl transition-all duration-300 hover:shadow-2xl"
    >
      <div className="absolute -left-12 -top-12 h-28 w-28 rounded-full bg-mint-soft opacity-70 blur-[1px]" />
      <div className="absolute right-8 top-2 h-20 w-32 rounded-full bg-white/35 blur-2xl" />
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="text-right">
          <p className="text-sm font-bold text-action">{hijriDate}</p>
        </div>
        <button onClick={handleLocationRequest} className="grid h-12 w-12 shrink-0 place-items-center rounded-[20px] bg-mint-soft text-xl text-action shadow-sm shadow-action/5" aria-label="تحديث موقعي لحساب مواقيت الصلاة">⌖</button>
      </div>

      <div className="relative z-10 mt-5 text-center">
        {faithOccasion && (
          <div className="mx-auto mb-3 max-w-[260px] rounded-[22px] bg-mint-soft px-4 py-2.5 text-center ring-1 ring-action/10">
            <p className="text-xs font-bold text-action">{faithOccasion.title}</p>
            <p className="mt-0.5 text-[11px] font-semibold leading-5 text-secondary-text">{faithOccasion.hint}</p>
          </div>
        )}
        <p className="text-sm font-medium text-secondary-text">الصلاة القادمة</p>
        <p className="mt-1 text-3xl font-bold text-primary-text">{PRAYER_LABELS[nextPrayer.name]}</p>
        <p className="mt-4 text-5xl font-bold tracking-tight text-action transition-all duration-300" dir="ltr">{countdown}</p>
        <p className="mt-2 text-sm text-secondary-text">متبقي على الأذان</p>
      </div>

      <div className="relative z-10 mt-5 grid grid-cols-5 gap-1 rounded-[26px] bg-primary-bg p-2">
        {prayerRows.map((prayer) => {
          const active = prayer.name === activePrayerName;
          return (
            <div key={prayer.name} className={`rounded-[18px] px-1 py-2 text-center ${active ? "bg-white/90 shadow-sm shadow-action/5" : ""}`}>
              <p className={`text-xs font-bold ${active ? "text-action" : "text-secondary-text"}`}>{PRAYER_LABELS[prayer.name]}</p>
              <p className="mt-1 text-[11px] font-semibold text-primary-text">{formatTime(prayer.adhan)}</p>
            </div>
          );
        })}
      </div>

      <div className="relative z-10 mt-4 rounded-[24px] bg-mint-soft p-3 text-center transition-all duration-300">
        <p className="text-sm font-semibold text-primary-text">
          {currentIqamahPrayer
            ? `متبقي على الإقامة: ${iqamahCountdown}`
            : `إقامة ${PRAYER_LABELS[nextPrayer.name]}: ${formatTime(nextPrayer.iqamah)}`}
        </p>
      </div>

      <p className="relative z-10 mt-3 text-center text-xs text-secondary-text">
        {shouldRefresh ? "يفضل تحديث الموقع لدقة أعلى" : daysSinceUpdate !== null ? `آخر تحديث للموقع قبل ${daysSinceUpdate} يوم` : "الموقع محفوظ"}
      </p>
    </motion.div>
  );
}
