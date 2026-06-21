import { useEffect, useMemo, useState } from 'react';
import { getPrayerTimesByCoordinates } from '../services/prayerApi';

const DEFAULT_TIMINGS = {
  Fajr: '04:08',
  Sunrise: '05:36',
  Dhuhr: '12:18',
  Asr: '15:43',
  Maghrib: '19:01',
  Isha: '20:31',
};

const PRAYER_LABELS = [
  ['Fajr', 'الفجر'],
  ['Sunrise', 'الشروق'],
  ['Dhuhr', 'الظهر'],
  ['Asr', 'العصر'],
  ['Maghrib', 'المغرب'],
  ['Isha', 'العشاء'],
];

function cleanTime(value) {
  return String(value || '').split(' ')[0].slice(0, 5);
}

function getNextPrayer(prayers) {
  const now = new Date();

  return prayers.find((prayer) => {
    const [hours, minutes] = prayer.time.split(':').map(Number);
    const prayerDate = new Date();
    prayerDate.setHours(hours, minutes, 0, 0);
    return prayerDate > now;
  }) || prayers[0];
}

export default function usePrayerTimes(coords) {
  const [timings, setTimings] = useState(DEFAULT_TIMINGS);
  const [locationName, setLocationName] = useState('المواقيت الافتراضية');
  const [dateLabel, setDateLabel] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!coords) return;

    let isActive = true;

    async function loadPrayerTimes() {
      setLoading(true);
      setError(null);

      try {
        const data = await getPrayerTimesByCoordinates(coords);

        if (!isActive) return;

        setTimings(data.timings);
        setLocationName(data.location);
        setDateLabel(data.date);
      } catch (err) {
        if (!isActive) return;
        setError(err.message || 'تعذر تحديث مواقيت الصلاة حسب موقعك.');
      } finally {
        if (isActive) setLoading(false);
      }
    }

    loadPrayerTimes();

    return () => {
      isActive = false;
    };
  }, [coords]);

  const prayers = useMemo(() => PRAYER_LABELS.map(([key, name]) => ({
    key,
    name,
    time: cleanTime(timings[key]),
  })), [timings]);

  const nextPrayer = useMemo(() => getNextPrayer(prayers), [prayers]);

  return { prayers, nextPrayer, locationName, dateLabel, error, loading, isDefault: !coords };
}
