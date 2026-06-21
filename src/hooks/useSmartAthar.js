import { useCallback, useMemo, useState } from 'react';
import { ATHAR_CONTENT } from '../data/atharContent';

const LAST_CONTENT_ID_KEY = 'athar-last-content-id';
const LAST_CONTENT_DATE_KEY = 'athar-last-content-date';
const SESSION_SEEN_IDS_KEY = 'athar-session-seen-ids';

const PERIOD_LABELS = {
  morning: 'مناسب لبداية اليوم',
  midday: 'مناسب لهذا الوقت',
  evening: 'مناسب للمساء',
  night: 'مناسب قبل النوم',
  general: 'أثر مناسب الآن',
};

const FALLBACK_ATHAR = {
  id: 'fallback-gentle-reminder',
  title: 'أثر اليوم',
  type: 'تذكير',
  text: 'اذكر الله بقلب حاضر، ولو بكلمة قصيرة.',
  source: 'تذكير عام',
  benefit: 'رسالة خفيفة تصلح لكل وقت.',
};

function readStorage(key, fallback = '') {
  try {
    return window.localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage failures so the Athar card always renders.
  }
}

function getTodayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function parsePrayerTime(prayer, date) {
  const match = String(prayer?.time || '').match(/^(\d{1,2}):(\d{2})/);

  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (Number.isNaN(hours) || Number.isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  const prayerDate = new Date(date);
  prayerDate.setHours(hours, minutes, 0, 0);

  return prayerDate;
}

function getPrayerMap(prayers, date) {
  return (Array.isArray(prayers) ? prayers : []).reduce((map, prayer) => {
    const prayerDate = parsePrayerTime(prayer, date);

    if (prayer?.key && prayerDate) {
      map[prayer.key] = prayerDate;
    }

    return map;
  }, {});
}

function determinePeriod(prayers, now = new Date()) {
  const prayerMap = getPrayerMap(prayers, now);
  const { Fajr, Dhuhr, Asr, Maghrib, Isha } = prayerMap;

  if (Fajr && Dhuhr && Asr && Maghrib && Isha) {
    if (now >= Fajr && now < Dhuhr) return 'morning';
    if (now >= Dhuhr && now < Asr) return 'midday';
    if (now >= Asr && now < Isha) return 'evening';
    return 'night';
  }

  const hour = now.getHours();

  if (hour >= 4 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 16) return 'midday';
  if (hour >= 16 && hour < 21) return 'evening';
  if (hour >= 21 || hour < 4) return 'night';

  return 'general';
}

function normalizeContent(content) {
  return (Array.isArray(content) ? content : []).filter((item) => (
    item?.id
    && item?.text
    && Array.isArray(item?.periods)
    && item.periods.length > 0
  ));
}

function readSeenIds(todayKey) {
  try {
    const parsed = JSON.parse(readStorage(SESSION_SEEN_IDS_KEY, '{}'));
    const ids = Array.isArray(parsed?.[todayKey]) ? parsed[todayKey] : [];
    return new Set(ids);
  } catch {
    return new Set();
  }
}

function writeSeenIds(todayKey, seenIds) {
  writeStorage(SESSION_SEEN_IDS_KEY, JSON.stringify({ [todayKey]: [...seenIds] }));
}

function pickAthar({ content, period, todayKey, forceRefresh = false }) {
  const validContent = normalizeContent(content);
  const periodItems = validContent.filter((item) => item.periods.includes(period));
  const generalItems = validContent.filter((item) => item.periods.includes('general'));
  const pool = periodItems.length ? periodItems : generalItems;

  if (!pool.length) return { athar: FALLBACK_ATHAR, isFallback: true };

  const lastDate = readStorage(LAST_CONTENT_DATE_KEY);
  const lastId = readStorage(LAST_CONTENT_ID_KEY);
  const seenIds = lastDate === todayKey ? readSeenIds(todayKey) : new Set();
  const freshPool = pool.filter((item) => !seenIds.has(item.id) && item.id !== lastId);
  const candidates = freshPool.length ? freshPool : pool.filter((item) => item.id !== lastId);
  const safeCandidates = candidates.length ? candidates : pool;
  const seed = forceRefresh ? Date.now() : todayKey.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const selected = safeCandidates[seed % safeCandidates.length];

  seenIds.add(selected.id);
  writeStorage(LAST_CONTENT_ID_KEY, selected.id);
  writeStorage(LAST_CONTENT_DATE_KEY, todayKey);
  writeSeenIds(todayKey, seenIds);

  return { athar: selected, isFallback: false };
}

export default function useSmartAthar(prayers) {
  const period = useMemo(() => determinePeriod(prayers), [prayers]);
  const todayKey = getTodayKey();
  const [refreshCount, setRefreshCount] = useState(0);

  const selection = useMemo(() => pickAthar({
    content: ATHAR_CONTENT,
    period,
    todayKey,
    forceRefresh: refreshCount > 0,
  }), [period, refreshCount, todayKey]);

  const refreshAthar = useCallback(() => {
    setRefreshCount((count) => count + 1);
  }, []);

  return {
    athar: selection.athar,
    period,
    refreshAthar,
    sourceLabel: PERIOD_LABELS[period] || PERIOD_LABELS.general,
    isFallback: selection.isFallback,
  };
}
