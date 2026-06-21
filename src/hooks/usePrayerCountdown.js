import { useEffect, useMemo, useState } from 'react';

const IQAMA_OFFSETS = {
  Fajr: 20,
  Dhuhr: 15,
  Asr: 15,
  Maghrib: 10,
  Isha: 15,
};

function parsePrayerDate(time, dayOffset = 0) {
  const match = String(time || '').match(/^(\d{1,2}):(\d{2})$/);

  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (Number.isNaN(hours) || Number.isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hours, minutes, 0, 0);

  return date;
}

function addMinutes(date, minutes) {
  if (!date || typeof minutes !== 'number') return null;
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function formatCountdown(target, now) {
  if (!target) return '00:00:00';

  const totalSeconds = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':');
}

function buildPrayerMoments(prayers, dayOffset = 0) {
  return (Array.isArray(prayers) ? prayers : [])
    .map((prayer) => {
      const adhanTime = parsePrayerDate(prayer?.time, dayOffset);
      const iqamaOffsetMinutes = IQAMA_OFFSETS[prayer?.key] ?? null;
      const iqamaTime = iqamaOffsetMinutes ? addMinutes(adhanTime, iqamaOffsetMinutes) : null;

      if (!adhanTime || !prayer?.key || !prayer?.name) return null;

      return {
        ...prayer,
        adhanTime,
        iqamaTime,
        iqamaOffsetMinutes,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.adhanTime - b.adhanTime);
}

function getCountdownState(prayers, now) {
  const todayMoments = buildPrayerMoments(prayers);

  for (const prayer of todayMoments) {
    if (now < prayer.adhanTime) {
      return {
        currentPrayer: null,
        nextPrayer: prayer,
        phase: 'before-adhan',
        label: `باقي على أذان ${prayer.name}`,
        targetTime: prayer.adhanTime,
        iqamaTime: prayer.iqamaTime,
        iqamaOffsetMinutes: prayer.iqamaOffsetMinutes,
      };
    }

    if (prayer.iqamaTime && now < prayer.iqamaTime) {
      return {
        currentPrayer: prayer,
        nextPrayer: prayer,
        phase: 'before-iqama',
        label: `باقي على إقامة ${prayer.name}`,
        targetTime: prayer.iqamaTime,
        iqamaTime: prayer.iqamaTime,
        iqamaOffsetMinutes: prayer.iqamaOffsetMinutes,
      };
    }
  }

  const tomorrowFajr = buildPrayerMoments(prayers, 1).find((prayer) => prayer.key === 'Fajr') || buildPrayerMoments(prayers, 1)[0];

  if (!tomorrowFajr) {
    return {
      currentPrayer: null,
      nextPrayer: null,
      phase: 'before-adhan',
      label: '',
      targetTime: null,
      iqamaTime: null,
      iqamaOffsetMinutes: null,
    };
  }

  return {
    currentPrayer: null,
    nextPrayer: tomorrowFajr,
    phase: 'before-adhan',
    label: `باقي على أذان ${tomorrowFajr.name}`,
    targetTime: tomorrowFajr.adhanTime,
    iqamaTime: tomorrowFajr.iqamaTime,
    iqamaOffsetMinutes: tomorrowFajr.iqamaOffsetMinutes,
  };
}

export default function usePrayerCountdown(prayers) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  return useMemo(() => {
    const state = getCountdownState(prayers, now);

    return {
      ...state,
      countdownText: formatCountdown(state.targetTime, now),
    };
  }, [prayers, now]);
}
