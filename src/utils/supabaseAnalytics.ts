import type { LocalAnalyticsEvent } from "./localAnalytics";

const SUPABASE_URL = "https://uhzbfvowicztvhuaftvt.supabase.co";
const SUPABASE_KEY = "sb_publishable_gCnnkKN_yY_o5JRkbQamWA_SjKuD7UG";
const EVENTS_TABLE = "athar_events";

type SupabaseEventRow = {
  event_name: string;
  created_at: string;
  page_path: string;
  device: string;
  standalone: boolean;
  params?: Record<string, string | number | boolean | undefined>;
};

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
};

const endpoint = (path: string) => `${SUPABASE_URL}/rest/v1/${path}`;

export const sendSupabaseAnalyticsEvent = async (event: LocalAnalyticsEvent) => {
  try {
    await fetch(endpoint(EVENTS_TABLE), {
      method: "POST",
      headers: { ...headers, Prefer: "return=minimal" },
      body: JSON.stringify({
        event_name: event.name,
        page_path: event.path,
        device: event.device,
        standalone: event.standalone,
        params: event.params || {},
      }),
      keepalive: true,
    });
  } catch {}
};

const isSameDay = (isoDate: string, dayOffset = 0) => {
  const target = new Date();
  target.setDate(target.getDate() - dayOffset);
  const date = new Date(isoDate);
  return date.getFullYear() === target.getFullYear() && date.getMonth() === target.getMonth() && date.getDate() === target.getDate();
};

const countBy = (items: string[]) =>
  items.reduce<Record<string, number>>((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {});

const sortedRows = (items: string[]) =>
  Object.entries(countBy(items))
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

export const fetchSupabaseAnalyticsSummary = async () => {
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const response = await fetch(endpoint(`${EVENTS_TABLE}?created_at=gte.${since}&select=event_name,created_at,page_path,device,standalone,params&order=created_at.desc&limit=1000`), {
      headers,
    });

    if (!response.ok) return null;
    const rows = (await response.json()) as SupabaseEventRow[];
    const pageViews = rows.filter((row) => row.event_name === "page_view");

    const todayVisits = pageViews.filter((row) => isSameDay(row.created_at)).length;
    const shares = rows.filter((row) => row.event_name.includes("share")).length;
    const installs = rows.filter((row) => row.event_name.includes("install")).length;
    const standaloneOpens = rows.filter((row) => row.standalone).length;
    const highIntent = rows.filter((row) => row.event_name === "athar_brain_decision" && Number(row.params?.score || 0) >= 7).length;

    const trend = Array.from({ length: 7 }).map((_, index) => {
      const offset = 6 - index;
      const label = offset === 0 ? "اليوم" : `قبل ${offset}`;
      return { name: label, value: rows.filter((row) => isSameDay(row.created_at, offset)).length };
    });

    const devices = sortedRows(rows.map((row) => row.device || "Unknown"));
    const topEvents = sortedRows(rows.map((row) => row.event_name));
    const topPages = sortedRows(pageViews.map((row) => row.page_path || "/"));

    return {
      source: "supabase" as const,
      totalEvents: rows.length,
      todayVisits,
      shares,
      installs,
      standaloneOpens,
      highIntent,
      trend,
      devices,
      topEvents,
      topPages,
    };
  } catch {
    return null;
  }
};
