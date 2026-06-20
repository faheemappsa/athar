import { useState, useEffect, useCallback, useRef } from 'react';
import useGeolocation from './useGeolocation';
import { getPrayerTimes } from '../services/prayerApi';
import islamicEvents from '../data/islamicEvents.json';

const IQAMA_OFFSETS = {
  Fajr: 15,
  Dhuhr: 10,
  Asr: 10,
  Maghrib: 10,
  Isha: 15
};

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function findNextPrayer(timings) {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const prayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  for (const prayer of prayers) {
    const prayerMinutes = timeToMinutes(timings[prayer]);
    if (prayerMinutes > currentMinutes) return prayer;
  }
  return 'Fajr';
}

function getIslamicEvent(hijriDay, hijriMonth, hijriMonthName) {
  const events = [];
  islamicEvents.forEach(event => {
    if (event.everyMonth && event.hijriDays.includes(hijriDay)) {
      events.push(event);
    } else if (event.hijriDay === hijriDay && event.hijriMonth === hijriMonth) {
      events.push(event);
    } else if (event.hijriDays && event.hijriMonth === hijriMonth) {
      if (event.hijriDays.includes(hijriDay)) events.push(event);
    }
  });
  return events;
}

export default function usePrayerTimes() {
  const { coords, error: geoError, loading: geoLoading, requestLocation } = useGeolocation();
  const [prayerData, setPrayerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [countdown, setCountdown] = useState('');
  const [nextPrayer, setNextPrayer] = useState(null);
  const intervalRef = useRef(null);

  const fetchPrayers = useCallback(async () => {
    if (!coords) return;
    setLoading(true);
    setApiError(null);
    try {
      const data = await getPrayerTimes(coords.latitude, coords.longitude);
      const hijri = data.date.hijri;
      const hijriMonth = hijri.month.number;
      const hijriDay = parseInt(hijri.day, 10);
      const hijriMonthName = hijri.month.ar;

      const events = getIslamicEvent(hijriDay, hijriMonth, hijriMonthName);

      setPrayerData({
        timings: data.timings,
        hijri: {
          day: hijri.day,
          month: hijriMonthName,
          year: hijri.year,
          weekday: hijri.weekday.ar
        },
        gregorian: data.date.gregorian,
        events
      });

      const next = findNextPrayer(data.timings);
      setNextPrayer(next);
    } catch {
      setApiError('تعذر جلب مواقيت الصلاة');
    } finally {
      setLoading(false);
    }
  }, [coords]);

  useEffect(() => {
    fetchPrayers();
  }, [fetchPrayers]);

  useEffect(() => {
    if (!prayerData || !nextPrayer) return;
    const tick = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
      const prayerTime = prayerData.timings[nextPrayer];
      if (!prayerTime) return;
      const prayerMinutes = timeToMinutes(prayerTime);
      let diff = prayerMinutes - currentMinutes;
      if (diff < 0) {
        fetchPrayers();
        return;
      }
      const offset = IQAMA_OFFSETS[nextPrayer] || 10;
      const iqamaMinutes = prayerMinutes + offset;
      const iqamaDiff = iqamaMinutes - currentMinutes;
      if (iqamaDiff > 0 && iqamaDiff < offset + 1) {
        const mins = Math.floor(iqamaDiff);
        const secs = Math.floor((iqamaDiff - mins) * 60);
        setCountdown(`باقٍ على الإقامة ${mins}:${secs.toString().padStart(2, '0')} دقيقة`);
      } else {
        const hrs = Math.floor(diff / 60);
        const mins = Math.floor(diff % 60);
        if (hrs > 0) {
          setCountdown(`متبقٍ على ${nextPrayer} ${hrs} ساعة و ${mins} دقيقة`);
        } else {
          setCountdown(`متبقٍ على ${nextPrayer} ${mins} دقيقة`);
        }
      }
    };
    tick();
    intervalRef.current = setInterval(tick, 1000);
    return () => clearInterval(intervalRef.current);
  }, [prayerData, nextPrayer, fetchPrayers]);

  return {
    coords,
    prayerData,
    countdown,
    nextPrayer,
    loading: loading || geoLoading,
    error: geoError || apiError,
    requestLocation,
    refresh: fetchPrayers
  };
}
