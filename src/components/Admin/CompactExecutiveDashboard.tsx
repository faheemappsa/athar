import { useEffect, useState } from "react";
import { fetchSupabaseAnalyticsSummary } from "../../utils/supabaseAnalytics";

type Summary = NonNullable<Awaited<ReturnType<typeof fetchSupabaseAnalyticsSummary>>>;
type Row = { name: string; value: number };
const sum = (rows: Row[] = []) => rows.reduce((a, r) => a + r.value, 0);
const pct = (v: number, t: number) => (t ? Math.round((v / t) * 100) : 0);

function Kpi({ label, value, hint, dark }: { label: string; value: string | number; hint: string; dark?: boolean }) {
  return <div className={dark ? "rounded-[24px] bg-white/10 p-3 ring-1 ring-white/10" : "rounded-[24px] bg-white p-3 shadow-sm ring-1 ring-action/10"}><p className={dark ? "text-[10px] font-black text-white/55" : "text-[10px] font-black text-secondary-text"}>{label}</p><p className={dark ? "mt-1 text-3xl font-black text-white" : "mt-1 text-3xl font-black text-action"}>{value}</p><p className={dark ? "text-[10px] font-bold text-white/50" : "text-[10px] font-bold text-secondary-text"}>{hint}</p></div>;
}

function Spark({ rows }: { rows: Row[] }) {
  const safe = rows.length ? rows : [{ name: "0", value: 0 }];
  const max = Math.max(1, ...safe.map((r) => r.value));
  const step = safe.length > 1 ? 250 / (safe.length - 1) : 250;
  const points = safe.map((r, i) => `${20 + i * step},${95 - (r.value / max) * 70}`).join(" ");
  return <svg viewBox="0 0 290 110" className="h-24 w-full text-action"><path d="M20 96H270" stroke="currentColor" strokeOpacity=".12" strokeWidth="2"/><polyline points={points} fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

function Bars({ rows }: { rows: Row[] }) {
  const top = rows.slice(0, 4);
  const max = Math.max(1, ...top.map((r) => r.value));
  const total = Math.max(1, sum(top));
  return <div className="space-y-3">{top.map((r) => <div key={r.name}><div className="mb-1 flex justify-between text-sm font-black"><span>{r.name}</span><span>{r.value} • {pct(r.value, total)}%</span></div><div className="h-4 rounded-full bg-action/10"><div className="h-4 rounded-full bg-action" style={{ width: `${Math.max(8, (r.value / max) * 100)}%` }} /></div></div>)}</div>;
}

export default function CompactExecutiveDashboard() {
  const [s, setS] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [updated, setUpdated] = useState("");
  const reload = () => { setLoading(true); fetchSupabaseAnalyticsSummary().then((d) => { setS(d); setUpdated(new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })); }).finally(() => setLoading(false)); };
  useEffect(() => reload(), []);
  if (!s) return <section className="rounded-[34px] bg-white p-5 shadow-xl">جاري تجهيز لوحة أثر...</section>;
  const visitors = s.todayVisitors || s.todayVisits || 0;
  const sessions = s.todaySessions || s.todayVisits || 0;
  const pages = sum(s.topPages || []);
  const cities = sum(s.topCities || []);
  const topPage = s.topPages?.[0];
  const topCity = s.topCities?.[0];
  return <section className="space-y-4">
    <div className="rounded-[38px] bg-[#1E1B18] p-5 text-white shadow-2xl"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black text-white/50">Athar Dashboard</p><h1 className="mt-1 text-3xl font-black">{topPage?.name || "أثر"} يقود الاستخدام</h1><p className="mt-2 text-xs font-bold leading-6 text-white/60">لوحة مختصرة قابلة للتصوير: اليوم + آخر 7 أيام.</p></div><button onClick={reload} disabled={loading} className="rounded-full bg-white px-4 py-2 text-xs font-black text-[#1E1B18]">{loading ? "..." : "تحديث"}</button></div><div className="mt-5 grid grid-cols-3 gap-2"><Kpi dark label="زوار" value={visitors} hint="اليوم"/><Kpi dark label="جلسات" value={sessions} hint="اليوم"/><Kpi dark label="نشاط" value={s.healthScore || 0} hint="Score"/></div></div>
    <div className="rounded-[34px] bg-white p-5 shadow-xl ring-1 ring-action/10"><div className="flex justify-between"><div><h2 className="text-xl font-black">نبض 7 أيام</h2><p className="mt-1 text-xs font-bold text-secondary-text">الاتجاه العام للجلسات.</p></div><span className="rounded-full bg-primary-bg px-3 py-1 text-xs font-black text-action">{updated || "Live"}</span></div><Spark rows={s.trend || []}/><div className="grid grid-cols-3 gap-2"><Kpi label="صفحات" value={pages} hint="Views"/><Kpi label="مشاركة" value={s.shares || 0} hint="Events"/><Kpi label="PWA" value={s.standaloneOpens || 0} hint="Opens"/></div></div>
    <div className="rounded-[34px] bg-white p-5 shadow-xl ring-1 ring-action/10"><h2 className="text-xl font-black">سلوك المستخدم</h2><p className="mt-1 text-xs font-bold leading-6 text-secondary-text">أقوى الصفحات خلال آخر 7 أيام.</p><div className="mt-4"><Bars rows={s.topPages || []}/></div></div>
    <div className="rounded-[34px] bg-white p-5 shadow-xl ring-1 ring-action/10"><h2 className="text-xl font-black">قرار تنفيذي</h2><p className="mt-3 rounded-2xl bg-primary-bg p-3 text-xs font-bold leading-6 text-secondary-text">الميزة الأقوى: {topPage?.name || "غير واضحة"}. المدينة الأعلى: {topCity?.name || "غير واضحة"}. عينة المدن المؤكدة: {cities}، فلا نبالغ في القرار الجغرافي قبل مقارنتها مع Google Analytics.</p></div>
  </section>;
}