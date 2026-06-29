import type { AtharSurface } from "./types";
import { readAtharMemory } from "./memory";

const DAILY_KEY = "athar-daily-intelligence-v1";
const DHIKR_COMPLETION_KEY = "athar-dhikr-completion-days";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

type AtharSection = "home" | "dhikr" | "quran" | "radio";

type DailyTask = {
  viewed: boolean;
  focusCount: number;
  taps: number;
  completed: boolean;
  lastAt: number | null;
};

export type AtharDailySnapshot = {
  day: string;
  startedAt: number;
  updatedAt: number;
  homeReturns: number;
  appReturns: number;
  sections: Partial<Record<AtharSection, number>>;
  lastSection: AtharSection | null;
  previousSection: AtharSection | null;
  dhikr: DailyTask;
  quran: DailyTask;
  atharCardTouches: number;
  highIntentScore: number;
};

export type AtharDailyFeedback = {
  isHighIntent: boolean;
  aura: "none" | "soft" | "attention" | "complete";
  message: string;
  reason: "dhikr_missing" | "quran_missing" | "complete_day" | "fresh_return" | "keep_going";
};

const getStorage = () => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

export const getAtharDayKey = (date = new Date()) => date.toISOString().slice(0, 10);

const createTask = (): DailyTask => ({ viewed: false, focusCount: 0, taps: 0, completed: false, lastAt: null });

export const createDailySnapshot = (now = Date.now()): AtharDailySnapshot => ({
  day: getAtharDayKey(new Date(now)),
  startedAt: now,
  updatedAt: now,
  homeReturns: 0,
  appReturns: 0,
  sections: {},
  lastSection: null,
  previousSection: null,
  dhikr: createTask(),
  quran: createTask(),
  atharCardTouches: 0,
  highIntentScore: 0,
});

const readDhikrCompletionToday = () => {
  const storage = getStorage();
  if (!storage) return false;

  try {
    const days = JSON.parse(storage.getItem(DHIKR_COMPLETION_KEY) || "[]") as string[];
    return days.includes(getAtharDayKey());
  } catch {
    return false;
  }
};

const mergeMemorySignals = (snapshot: AtharDailySnapshot) => {
  try {
    const memory = readAtharMemory();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEvents = memory.recentEvents.filter((event) => event.timestamp >= todayStart.getTime());

    const dhikrEvents = todayEvents.filter((event) => event.surface === "dhikr-card");
    const quranEvents = todayEvents.filter((event) => event.surface === "quran-page");

    if (dhikrEvents.length > 0 || (snapshot.sections.dhikr || 0) > 0) snapshot.dhikr.viewed = true;
    snapshot.dhikr.taps = Math.max(snapshot.dhikr.taps, dhikrEvents.filter((event) => event.type === "dhikr_tap" || event.type === "surface_click").length);
    snapshot.dhikr.focusCount = Math.max(snapshot.dhikr.focusCount, dhikrEvents.filter((event) => event.type === "surface_focus").length);
    snapshot.dhikr.completed = snapshot.dhikr.completed || readDhikrCompletionToday();
    snapshot.dhikr.lastAt = dhikrEvents[0]?.timestamp || snapshot.dhikr.lastAt;

    if (quranEvents.length > 0 || (snapshot.sections.quran || 0) > 0) snapshot.quran.viewed = true;
    snapshot.quran.focusCount = Math.max(snapshot.quran.focusCount, quranEvents.filter((event) => event.type === "surface_focus").length);
    snapshot.quran.lastAt = quranEvents[0]?.timestamp || snapshot.quran.lastAt;
  } catch {}

  return snapshot;
};

const normalizeDaily = (raw: Partial<AtharDailySnapshot> | null | undefined, now = Date.now()) => {
  const today = getAtharDayKey(new Date(now));
  if (!raw || raw.day !== today) return mergeMemorySignals(createDailySnapshot(now));

  return mergeMemorySignals({
    ...createDailySnapshot(now),
    ...raw,
    updatedAt: raw.updatedAt || now,
    sections: raw.sections || {},
    dhikr: { ...createTask(), ...(raw.dhikr || {}) },
    quran: { ...createTask(), ...(raw.quran || {}) },
  } as AtharDailySnapshot);
};

export const readAtharDailySnapshot = () => {
  const storage = getStorage();
  if (!storage) return createDailySnapshot();

  try {
    const raw = storage.getItem(DAILY_KEY);
    return normalizeDaily(raw ? JSON.parse(raw) : null);
  } catch {
    return createDailySnapshot();
  }
};

const writeAtharDailySnapshot = (snapshot: AtharDailySnapshot) => {
  const storage = getStorage();
  if (!storage) return snapshot;

  try {
    storage.setItem(DAILY_KEY, JSON.stringify(snapshot));
  } catch {}

  return snapshot;
};

const scoreDaily = (snapshot: AtharDailySnapshot) => {
  let score = 0;
  score += Math.min(6, snapshot.homeReturns * 1.25);
  score += Math.min(5, Object.values(snapshot.sections).reduce((sum, visits) => sum + (visits || 0), 0) * 0.6);
  score += snapshot.dhikr.viewed ? 2 : 0;
  score += Math.min(4, snapshot.dhikr.taps * 0.25);
  score += snapshot.quran.viewed ? 2 : 0;
  score += Math.min(4, snapshot.quran.focusCount * 1.4);
  score += Math.min(3, snapshot.appReturns * 0.75);
  return Number(score.toFixed(2));
};

const commitDaily = (snapshot: AtharDailySnapshot) => {
  const next = { ...mergeMemorySignals(snapshot), updatedAt: Date.now() };
  next.highIntentScore = scoreDaily(next);
  return writeAtharDailySnapshot(next);
};

export const recordAtharSectionVisit = (section: AtharSection) => {
  const snapshot = readAtharDailySnapshot();
  const previousSection = snapshot.lastSection;
  snapshot.previousSection = previousSection;
  snapshot.lastSection = section;
  snapshot.sections[section] = (snapshot.sections[section] || 0) + 1;
  if (section === "home" && previousSection && previousSection !== "home") snapshot.homeReturns += 1;
  return commitDaily(snapshot);
};

export const recordAtharAppReturn = () => {
  const snapshot = readAtharDailySnapshot();
  snapshot.appReturns += 1;
  return commitDaily(snapshot);
};

export const recordAtharCardTouch = () => {
  const snapshot = readAtharDailySnapshot();
  snapshot.atharCardTouches += 1;
  return commitDaily(snapshot);
};

export const recordAtharSurfaceDailySignal = (input: {
  surface: AtharSurface;
  type: "view" | "focus" | "tap" | "complete";
}) => {
  const snapshot = readAtharDailySnapshot();
  const now = Date.now();

  if (input.surface === "dhikr-card") {
    if (input.type === "view") snapshot.dhikr.viewed = true;
    if (input.type === "focus") snapshot.dhikr.focusCount += 1;
    if (input.type === "tap") snapshot.dhikr.taps += 1;
    if (input.type === "complete") snapshot.dhikr.completed = true;
    snapshot.dhikr.lastAt = now;
  }

  if (input.surface === "quran-page") {
    if (input.type === "view") snapshot.quran.viewed = true;
    if (input.type === "focus") snapshot.quran.focusCount += 1;
    if (input.type === "complete") snapshot.quran.completed = true;
    snapshot.quran.lastAt = now;
  }

  return commitDaily(snapshot);
};

const isRecentlyActive = (snapshot: AtharDailySnapshot) => Date.now() - snapshot.updatedAt <= ONE_DAY_MS;

export const getAtharDailyFeedback = (): AtharDailyFeedback => {
  const snapshot = readAtharDailySnapshot();
  const isHighIntent = snapshot.highIntentScore >= 7 || snapshot.homeReturns >= 2 || (snapshot.dhikr.viewed && snapshot.quran.viewed);

  if (!isRecentlyActive(snapshot)) {
    return { isHighIntent: false, aura: "none", message: "خذ أثر اليوم بهدوء.", reason: "fresh_return" };
  }

  if (snapshot.dhikr.viewed && !snapshot.dhikr.completed && (snapshot.homeReturns > 0 || snapshot.dhikr.taps > 0)) {
    return { isHighIntent, aura: isHighIntent ? "attention" : "soft", message: "لا تنسى تكمل أذكارك.", reason: "dhikr_missing" };
  }

  if (snapshot.quran.viewed && snapshot.quran.focusCount < 2 && snapshot.homeReturns > 0) {
    return { isHighIntent, aura: isHighIntent ? "attention" : "soft", message: "لا تترك وردك من المصحف.", reason: "quran_missing" };
  }

  if (snapshot.dhikr.completed && snapshot.quran.viewed) {
    return { isHighIntent: true, aura: "complete", message: "يومك مكتمل.. وأثرك باقي.", reason: "complete_day" };
  }

  if (isHighIntent) {
    return { isHighIntent, aura: "soft", message: "واضح إن لك أثر اليوم.. خذ لحظة وكمّل.", reason: "keep_going" };
  }

  return { isHighIntent, aura: snapshot.homeReturns > 0 ? "soft" : "none", message: "أثر جديد ينتظرك.", reason: "fresh_return" };
};
