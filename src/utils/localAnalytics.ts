import { getSavedAnalyticsLocation } from "./locationAnalytics";
import { sendSupabaseAnalyticsEvent } from "./supabaseAnalytics";

const LOCAL_ANALYTICS_KEY = "athar-local-analytics-v1";
const VISITOR_ID_KEY = "athar-visitor-id";
const SESSION_ID_KEY = "athar-session-id";
const SESSION_LAST_SEEN_KEY = "athar-session-last-seen";
const SESSION_PWA_RECORDED_KEY = "athar-session-pwa-recorded";
const MAX_EVENTS = 500;
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

export type LocalAnalyticsEvent = {
  name: string;
  at: number;
  path: string;
  device: "iPhone" | "Android" | "Desktop" | "Other";
  standalone: boolean;
  params?: Record<string, string | number | boolean | undefined>;
};

const getStorage = () => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const createId = (prefix: string) => {
  try {
    const random = crypto.getRandomValues(new Uint32Array(4)).join("");
    return `${prefix}_${Date.now().toString(36)}_${random}`;
  } catch {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
  }
};

const getOrCreateVisitorId = (storage: Storage) => {
  const existing = storage.getItem(VISITOR_ID_KEY);
  if (existing) return existing;

  const next = createId("visitor");
  storage.setItem(VISITOR_ID_KEY, next);
  return next;
};

const getOrCreateSessionId = (storage: Storage) => {
  const now = Date.now();
  const existing = storage.getItem(SESSION_ID_KEY);
  const lastSeen = Number(storage.getItem(SESSION_LAST_SEEN_KEY) || 0);
  const isExpired = !lastSeen || now - lastSeen > SESSION_TIMEOUT_MS;

  if (!existing || isExpired) {
    const next = createId("session");
    storage.setItem(SESSION_ID_KEY, next);
    storage.setItem(SESSION_LAST_SEEN_KEY, String(now));
    storage.removeItem(SESSION_PWA_RECORDED_KEY);
    return { sessionId: next, isNewSession: true };
  }

  storage.setItem(SESSION_LAST_SEEN_KEY, String(now));
  return { sessionId: existing, isNewSession: false };
};

const getDevice = (): LocalAnalyticsEvent["device"] => {
  const ua = navigator.userAgent || "";
  if (/iPhone|iPad|iPod/i.test(ua)) return "iPhone";
  if (/Android/i.test(ua)) return "Android";
  if (/Macintosh|Windows|Linux/i.test(ua)) return "Desktop";
  return "Other";
};

const isStandalone = () => {
  try {
    return window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
  } catch {
    return false;
  }
};

export const readLocalAnalyticsEvents = (): LocalAnalyticsEvent[] => {
  const storage = getStorage();
  if (!storage) return [];

  try {
    const raw = JSON.parse(storage.getItem(LOCAL_ANALYTICS_KEY) || "[]") as LocalAnalyticsEvent[];
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
};

const persistAnalyticsEvent = (storage: Storage, event: LocalAnalyticsEvent) => {
  const next = [event, ...readLocalAnalyticsEvents()].slice(0, MAX_EVENTS);
  storage.setItem(LOCAL_ANALYTICS_KEY, JSON.stringify(next));
  void sendSupabaseAnalyticsEvent(event);
};

const createAnalyticsEvent = (
  name: string,
  params: LocalAnalyticsEvent["params"],
  shared: { visitorId: string; sessionId: string; device: LocalAnalyticsEvent["device"]; standalone: boolean }
): LocalAnalyticsEvent => {
  const savedLocation = getSavedAnalyticsLocation();

  return {
    name,
    at: Date.now(),
    path: window.location.pathname,
    device: shared.device,
    standalone: shared.standalone,
    params: {
      ...(params || {}),
      visitor_id: shared.visitorId,
      session_id: shared.sessionId,
      city: savedLocation?.city,
      region: savedLocation?.region,
      city_distance_km: savedLocation?.distance_km,
    },
  };
};

const maybeRecordPwaOpen = (storage: Storage, shared: { visitorId: string; sessionId: string; device: LocalAnalyticsEvent["device"]; standalone: boolean }) => {
  if (!shared.standalone) return;
  if (storage.getItem(SESSION_PWA_RECORDED_KEY) === shared.sessionId) return;

  storage.setItem(SESSION_PWA_RECORDED_KEY, shared.sessionId);
  persistAnalyticsEvent(storage, createAnalyticsEvent("pwa_opened", { pwa_opened: true }, shared));
};

export const recordLocalAnalyticsEvent = (name: string, params?: LocalAnalyticsEvent["params"]) => {
  const storage = getStorage();
  if (!storage) return;
  if (window.location.pathname.startsWith("/admin")) return;

  try {
    const visitorId = getOrCreateVisitorId(storage);
    const { sessionId, isNewSession } = getOrCreateSessionId(storage);
    const shared = {
      visitorId,
      sessionId,
      device: getDevice(),
      standalone: isStandalone(),
    };

    if (isNewSession) {
      persistAnalyticsEvent(storage, createAnalyticsEvent("session_start", { session_started: true }, shared));
    }

    maybeRecordPwaOpen(storage, shared);
    persistAnalyticsEvent(storage, createAnalyticsEvent(name, params, shared));
  } catch {}
};

const isSameDay = (timestamp: number, dayOffset = 0) => {
  const target = new Date();
  target.setDate(target.getDate() - dayOffset);
  const date = new Date(timestamp);
  return date.getFullYear() === target.getFullYear() && date.getMonth() === target.getMonth() && date.getDate() === target.getDate();
};

const countBy = <T extends string>(items: T[]) => {
  return items.reduce<Record<T, number>>((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {} as Record<T, number>);
};

const uniqueCount = (items: Array<string | number | boolean | undefined>) => new Set(items.filter(Boolean).map(String)).size;

export const getLocalAnalyticsSummary = () => {
  const events = readLocalAnalyticsEvents();
  const todayEvents = events.filter((event) => isSameDay(event.at));
  const shares = events.filter((event) => event.name.includes("share"));
  const installs = events.filter((event) => event.name === "app_installed");
  const standaloneOpens = events.filter((event) => event.name === "pwa_opened");
  const highIntent = events.filter((event) => event.name === "athar_brain_decision" && Number(event.params?.score || 0) >= 7);

  const trend = Array.from({ length: 7 }).map((_, index) => {
    const offset = 6 - index;
    const label = offset === 0 ? "اليوم" : `قبل ${offset}`;
    return { name: label, value: events.filter((event) => isSameDay(event.at, offset)).length };
  });

  const deviceCounts = countBy(events.map((event) => event.device));
  const devices = Object.entries(deviceCounts).map(([name, value]) => ({ name, value }));

  const eventCounts = countBy(events.map((event) => event.name));
  const topEvents = Object.entries(eventCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  return {
    source: "local" as const,
    totalEvents: events.length,
    todayVisits: todayEvents.filter((event) => event.name === "page_view").length,
    todayVisitors: uniqueCount(todayEvents.map((event) => event.params?.visitor_id)),
    todaySessions: uniqueCount(todayEvents.map((event) => event.params?.session_id)),
    shares: shares.length,
    installs: installs.length,
    standaloneOpens: standaloneOpens.length,
    highIntent: highIntent.length,
    trend,
    devices,
    topEvents,
  };
};
