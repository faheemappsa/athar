import { getSavedAnalyticsLocation } from "./locationAnalytics";
import { sendSupabaseAnalyticsEvent } from "./supabaseAnalytics";

const LOCAL_ANALYTICS_KEY = "athar-local-analytics-v1";
const MAX_EVENTS = 500;

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

export const recordLocalAnalyticsEvent = (name: string, params?: LocalAnalyticsEvent["params"]) => {
  const storage = getStorage();
  if (!storage) return;
  if (window.location.pathname.startsWith("/admin")) return;

  try {
    const savedLocation = getSavedAnalyticsLocation();
    const event: LocalAnalyticsEvent = {
      name,
      at: Date.now(),
      path: window.location.pathname,
      device: getDevice(),
      standalone: isStandalone(),
      params: {
        ...(params || {}),
        city: savedLocation?.city,
        region: savedLocation?.region,
        city_distance_km: savedLocation?.distance_km,
      },
    };
    const next = [event, ...readLocalAnalyticsEvents()].slice(0, MAX_EVENTS);
    storage.setItem(LOCAL_ANALYTICS_KEY, JSON.stringify(next));
    void sendSupabaseAnalyticsEvent(event);
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

export const getLocalAnalyticsSummary = () => {
  const events = readLocalAnalyticsEvents();
  const todayEvents = events.filter((event) => isSameDay(event.at));
  const shares = events.filter((event) => event.name.includes("share"));
  const installs = events.filter((event) => event.name.includes("install"));
  const standaloneOpens = events.filter((event) => event.standalone);
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
    shares: shares.length,
    installs: installs.length,
    standaloneOpens: standaloneOpens.length,
    highIntent: highIntent.length,
    trend,
    devices,
    topEvents,
  };
};
