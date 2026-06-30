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

const uniqueCount = (items: Array<string | number | boolean | undefined>) => new Set(items.filter(Boolean).map(String)).size;

const eventLabels: Record<string, string> = {
  page_view: "فتح صفحة",
  session_start: "بداية جلسة",
  pwa_opened: "فتح كتطبيق",
  athar_content_view: "قراءة محتوى",
  athar_brain_decision: "قرار الذكاء",
  nav_home: "فتح الرئيسية",
  nav_dhikr: "فتح الأذكار",
  nav_quran: "فتح المصحف",
  nav_radio: "فتح الإذاعة",
  athar_share_start: "بدأ مشاركة",
  athar_share_success: "مشاركة ناجحة",
  athar_share_error: "فشل مشاركة",
  install_prompt_shown: "ظهور التثبيت",
  beforeinstallprompt: "جاهز للتثبيت",
  app_installed: "تثبيت التطبيق",
  location_updated: "تحديث الموقع",
};

const pageLabels: Record<string, string> = {
  "/": "الرئيسية",
  "/dhikr": "الأذكار",
  "/quran": "المصحف",
  "/radio": "الإذاعة",
};

const labelEvent = (name: string) => eventLabels[name] || name.replaceAll("_", " ");
const labelPage = (path: string) => pageLabels[path] || path.replace(/^\//, "");

const sortedRows = (items: string[]) =>
  Object.entries(countBy(items.filter(Boolean)))
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

const clampScore = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const getHealthScore = (input: { todaySessions: number; shares: number; standaloneOpens: number; highIntent: number; totalEvents: number }) => {
  const activity = Math.min(35, input.todaySessions * 9);
  const sharing = Math.min(25, input.shares * 5);
  const appUse = Math.min(20, input.standaloneOpens * 6);
  const loyalty = Math.min(20, input.highIntent * 5);
  const baseline = input.totalEvents > 0 ? 10 : 0;
  return clampScore(baseline + activity + sharing + appUse + loyalty);
};

const cityFrom = (row: SupabaseEventRow) => String(row.params?.city || "").trim();
const visitorFrom = (row: SupabaseEventRow) => row.params?.visitor_id;
const sessionFrom = (row: SupabaseEventRow) => row.params?.session_id;

const getCitySourceRows = (rows: SupabaseEventRow[]) => {
  const locationRows = rows.filter((row) => row.event_name === "location_updated" && cityFrom(row));
  return locationRows.length ? locationRows : rows.filter((row) => cityFrom(row));
};

const getCityRowsByVisitor = (rows: SupabaseEventRow[]) => {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const city = cityFrom(row);
    if (!city) return false;
    const key = String(visitorFrom(row) || sessionFrom(row) || `${city}-${row.created_at}`);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const fetchSupabaseAnalyticsSummary = async () => {
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const response = await fetch(endpoint(`${EVENTS_TABLE}?created_at=gte.${since}&select=event_name,created_at,page_path,device,standalone,params&order=created_at.desc&limit=1000`), {
      headers,
    });

    if (!response.ok) return null;
    const rows = (await response.json()) as SupabaseEventRow[];
    const pageViews = rows.filter((row) => row.event_name === "page_view");
    const activeRows = rows.filter((row) => Date.now() - new Date(row.created_at).getTime() <= 5 * 60 * 1000);
    const todayRows = rows.filter((row) => isSameDay(row.created_at));
    const cityRows = getCityRowsByVisitor(getCitySourceRows(rows));
    const activeCityRows = getCityRowsByVisitor(getCitySourceRows(activeRows));

    const todayVisits = pageViews.filter((row) => isSameDay(row.created_at)).length;
    const todayVisitors = uniqueCount(todayRows.map(visitorFrom));
    const todaySessions = uniqueCount(todayRows.map(sessionFrom)) || rows.filter((row) => row.event_name === "session_start" && isSameDay(row.created_at)).length;
    const shares = rows.filter((row) => row.event_name.includes("share")).length;
    const installs = rows.filter((row) => row.event_name === "app_installed").length;
    const standaloneOpens = rows.filter((row) => row.event_name === "pwa_opened").length || uniqueCount(rows.filter((row) => row.standalone).map(sessionFrom));
    const installConversion = todayVisitors > 0 ? clampScore((standaloneOpens / todayVisitors) * 100) : 0;
    const highIntent = rows.filter((row) => row.event_name === "athar_brain_decision" && Number(row.params?.score || 0) >= 7).length;
    const activeNow = uniqueCount(activeRows.map(sessionFrom)) || uniqueCount(activeRows.map(visitorFrom)) || activeRows.length;
    const healthScore = getHealthScore({ todaySessions: todaySessions || todayVisits, shares, standaloneOpens, highIntent, totalEvents: rows.length });
    const funnel = [
      { name: "زائر", value: todayVisitors || todayVisits },
      { name: "جلسة", value: todaySessions || todayVisits },
      { name: "مشاركة", value: shares },
      { name: "تثبيت", value: installs },
      { name: "فتح كتطبيق", value: standaloneOpens },
    ];

    const trend = Array.from({ length: 7 }).map((_, index) => {
      const offset = 6 - index;
      const label = offset === 0 ? "اليوم" : `قبل ${offset}`;
      const dayRows = rows.filter((row) => isSameDay(row.created_at, offset));
      const sessions = uniqueCount(dayRows.map(sessionFrom));
      return { name: label, value: sessions || dayRows.length };
    });

    const devices = sortedRows(rows.map((row) => row.device || "غير معروف"));
    const topEvents = sortedRows(rows.map((row) => labelEvent(row.event_name)));
    const topPages = sortedRows(pageViews.map((row) => labelPage(row.page_path || "/")));
    const topCities = sortedRows(cityRows.map(cityFrom));
    const activeCities = sortedRows(activeCityRows.map(cityFrom));
    const lastActivity = activeRows[0] ? labelEvent(activeRows[0].event_name) : "لا يوجد نشاط الآن";

    return {
      source: "supabase" as const,
      totalEvents: rows.length,
      todayVisits,
      todayVisitors,
      todaySessions,
      shares,
      installs,
      standaloneOpens,
      installConversion,
      highIntent,
      healthScore,
      activeNow,
      lastActivity,
      funnel,
      trend,
      devices,
      topEvents,
      topPages,
      topCities,
      activeCities,
    };
  } catch {
    return null;
  }
};
