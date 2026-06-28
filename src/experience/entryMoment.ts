import type { AtharEntryMoment } from "./types";
import { readAtharMemory, registerAtharVisit } from "./memory";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const startOfDay = (time: number) => {
  const date = new Date(time);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

const getTimeBand = (hour: number): AtharEntryMoment["timeBand"] => {
  if (hour >= 3 && hour < 5) return "pre-fajr";
  if (hour >= 5 && hour < 11) return "morning";
  if (hour >= 11 && hour < 14) return "midday";
  if (hour >= 14 && hour < 18) return "afternoon";
  if (hour >= 18 && hour < 22) return "evening";
  if (hour >= 22 || hour < 1) return "night";
  return "late-night";
};

const countVisitsToday = (timestamp: number) => {
  const memory = readAtharMemory();
  const todayStart = startOfDay(timestamp);
  return memory.recentEvents.filter((event) => event.timestamp >= todayStart).length > 0 ? 1 : 0;
};

export const scanAtharEntryMoment = (): AtharEntryMoment => {
  const before = readAtharMemory();
  const timestamp = Date.now();
  const now = new Date(timestamp);
  const previousVisitCount = before.visitCount || 0;
  const previousLastSeenAt = before.lastSeenAt || null;
  const daysSinceLastVisit = previousLastSeenAt
    ? Math.max(0, Math.floor((startOfDay(timestamp) - startOfDay(previousLastSeenAt)) / MS_PER_DAY))
    : null;

  const updated = registerAtharVisit();
  const hour = now.getHours();
  const dayOfWeek = now.getDay();

  return {
    timestamp,
    visitCount: updated.visitCount,
    isFirstVisit: previousVisitCount === 0,
    visitsToday: countVisitsToday(timestamp) + 1,
    daysSinceLastVisit,
    hour,
    dayOfWeek,
    isFriday: dayOfWeek === 5,
    timeBand: getTimeBand(hour),
  };
};
