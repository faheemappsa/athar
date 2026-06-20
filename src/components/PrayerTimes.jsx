import { motion } from 'framer-motion';
import usePrayerTimes from '../hooks/usePrayerTimes';

const PRAYER_NAMES = {
  Fajr: 'الفجر',
  Sunrise: 'الشروق',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء'
};

export default function PrayerTimes() {
  const {
    prayerData,
    countdown,
    loading,
    error,
    requestLocation,
    refresh
  } = usePrayerTimes();

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.8 }}
      className="text-center px-6 mt-10 w-full select-none"
    >
      <div className="text-white/40 text-xs md:text-sm font-arabic tracking-widest uppercase mb-3">
        مواقيت الصلاة
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-6 backdrop-blur-md shadow-lg">
        {loading && (
          <div className="text-white/40 text-sm font-arabic animate-pulse py-8">
            جاري تحديد موقعك...
          </div>
        )}

        {error && (
          <div className="space-y-4 py-4">
            <div className="text-red-300/70 text-sm font-arabic">{error}</div>
            <button
              onClick={requestLocation}
              className="bg-white/10 hover:bg-white/20 text-white/80 text-sm font-arabic px-6 py-2 rounded-xl transition-all duration-300"
            >
              📍 تحديد الموقع
            </button>
          </div>
        )}

        {prayerData && !error && (
          <>
            <div className="flex items-center justify-center gap-2 text-white/80 text-sm md:text-base font-arabic mb-1">
              <span>
                {prayerData.hijri.weekday} {prayerData.hijri.day} {prayerData.hijri.month} {prayerData.hijri.year} هـ
              </span>
            </div>
            <div className="text-white/30 text-xs font-arabic mb-4">
              {prayerData.gregorian.date}
            </div>

            {prayerData.events.length > 0 && (
              <div className="mb-4 flex flex-wrap justify-center gap-2">
                {prayerData.events.map((ev, i) => (
                  <span
                    key={i}
                    className="bg-amber-500/20 text-amber-200/90 text-xs font-arabic px-3 py-1 rounded-full border border-amber-500/30"
                  >
                    {ev.name} – {ev.description}
                  </span>
                ))}
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 mt-4">
              {Object.entries(PRAYER_NAMES).map(([key, name]) => (
                <div
                  key={key}
                  className="bg-white/5 rounded-xl px-2 py-3 text-center"
                >
                  <div className="text-white/50 text-xs font-arabic">{name}</div>
                  <div className="text-white/80 text-sm font-arabic mt-1">
                    {prayerData.timings[key] || '--:--'}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-amber-300/90 text-sm font-arabic animate-pulse">
              {countdown}
            </div>

            <button
              onClick={refresh}
              className="mt-4 text-white/30 hover:text-white/50 text-xs font-arabic underline underline-offset-4 transition-colors duration-300"
            >
              تحديث
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
