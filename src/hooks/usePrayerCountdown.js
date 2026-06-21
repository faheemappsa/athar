import { useEffect, useMemo, useState } from 'react';

const IQAMA_OFFSETS_MINUTES = {
  Fajr: 20,
  Dhuhr: 15,
  Asr: 15,
  Maghrib: 10,
  Isha: 15,
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function parsePrayerDate(time, baseDate = new Date()) {
  const [hours, minutes] = String(time || '').split(':').map(Number);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

  const prayerDate = new Date(baseDate);
  prayerDate.setHours(hours, minutes, 0, 0);
  return prayerDate;
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function formatCountdown(milliseconds) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, '0'))
    .join(':');
}

function buildPrayerEvent(prayers, now) {
  const today = new Date(now);
  const tomorrow = new Date(now.getTime() + ONE_DAY_MS);

  for (const prayer of prayers || []) {
    const adhanTime = parsePrayerDate(prayer?.time, today);

    if (!adhanTime) continue;

    const iqamaOffsetMinutes = IQAMA_OFFSETS_MINUTES[prayer.key] ?? null;
    const iqamaTime = iqamaOffsetMinutes == null ? null : addMinutes(adhanTime, iqamaOffsetMinutes);

    if (now < adhanTime) {
      return {
        currentPrayer: null,
        nextPrayer: prayer,
        phase: 'before-adhan',
        label: `باقي على أذان ${prayer.name}`,
        targetTime: adhanTime,
        iqamaTime,
        iqamaOffsetMinutes,
      };
    }

    if (iqamaTime && now < iqamaTime) {
      return {
        currentPrayer: prayer,
        nextPrayer: prayer,
        phase: 'before-iqama',
        label: `باقي على إقامة ${prayer.name}`,
        targetTime: iqamaTime,
        iqamaTime,
        iqamaOffsetMinutes,
      };
    }
  }

  const fajr = (prayers || []).find((prayer) => prayer?.key === 'Fajr');
  const fallbackPrayer = fajr || (prayers || [])[0] || null;
  const tomorrowFajr = fallbackPrayer ? parsePrayerDate(fallbackPrayer.time, tomorrow) : null;

  return {
    currentPrayer: null,
    nextPrayer: fallbackPrayer,
    phase: 'before-adhan',
    label: fallbackPrayer ? `باقي على أذان ${fallbackPrayer.name}` : 'مواقيت الصلاة',
    targetTime: tomorrowFajr,
    iqamaTime: tomorrowFajr && IQAMA_OFFSETS_MINUTES[fallbackPrayer?.key]
      ? addMinutes(tomorrowFajr, IQAMA_OFFSETS_MINUTES[fallbackPrayer.key])
      : null,
    iqamaOffsetMinutes: IQAMA_OFFSETS_MINUTES[fallbackPrayer?.key] ?? null,
  };
}

export default function usePrayerCountdown(prayers) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return useMemo(() => {
    const event = buildPrayerEvent(prayers, now);
    const countdownText = event.targetTime
      ? formatCountdown(event.targetTime.getTime() - now.getTime())
      : '--:--:--';

    return {
      ...event,
      countdownText,
    };
  }, [prayers, now]);
}
