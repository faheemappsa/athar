import { useEffect, useState } from "react";
import { fetchSupabaseAnalyticsSummary } from "../../utils/supabaseAnalytics";

type Summary = NonNullable<Awaited<ReturnType<typeof fetchSupabaseAnalyticsSummary>>>;
type Row = { name: string; value: number };
const total = (rows: Row[] = []) => rows.reduce((n, row) => n + row.value, 0);
const rate = (n: number, d: number) => d > 0 ? Math.round((n / d) * 100) : 0;

function List({ rows, totalValue }: { rows: Row[]; totalValue: number }) {
  return <div className="mt-4 space-y-3">{rows.slice(0, 6).map((row) => <div key={row.name}><div className="mb-1 flex justify-between text-xs font-black"><span>{row.name}</span><span>{row.value} · {rate(row.value,totalValue)}%</span></div><div className="h-2 rounded-full bg-action/10"><div className="h-2 rounded-full bg-action" style={{ width: `${Math.max(5,rate(row.value,totalValue))}%` }} /></div></div>)}</div>;
}

export default function AtharDecisionDashboard() {
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const load = () => { setLoading(true); fetchSupabaseAnalyticsSummary().then(setData).finally(() => setLoading(false)); };
  useEffect(load, []);
  if (!data) return <div className="rounded-[32px] bg-white p-6 text-center font-bold">جاري قراءة البيانات...</div>;

  const cityTotal = total(data.topCities || []);
  const pageViews = total(data.topPages || []);
  const sessions = total(data.trend || []);
  const depth = sessions ? (pageViews / sessions).toFixed(1) : "0";
  const topCity = data.topCities?.[0];
  const topPage = data.topPages?.[0];
  const confidence = cityTotal >= 20 ? "قوية" : cityTotal >= 10 ? "متوسطة" : "مبكرة";
  const decision = cityTotal < 10 ? "المدن صارت واضحة، لكن العينة صغيرة. نواصل القياس قبل توجيه إعلان حسب مدينة." : topCity ? `${topCity.name} تقود الاستخدام الآن. جرّب إعلانًا صغيرًا موجهًا لها وقارنها بالمدينة الثانية.` : "لا توجد مدينة قائدة حتى الآن.";

  return <section className="space-y-4">
    <div className="rounded-[38px] bg-[#1E1B18] p-5 text-white shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-[10px] font-black tracking-widest text-white/40">ATHAR INTELLIGENCE</p><h1 className="mt-2 text-3xl font-black">لوحة قرار أثر</h1><p className="mt-1 text-xs font-bold text-white/50">آخر 7 أيام · المدن أولًا</p></div><button onClick={load} className="rounded-full bg-white/10 px-4 py-2 text-[11px] font-black ring-1 ring-white/15">{loading ? "..." : "تحديث"}</button></div><div className="mt-5 grid grid-cols-2 gap-2">{[["مدن مؤكدة", cityTotal, "مستخدم/مدينة"],["الجلسات", sessions, "آخر 7 أيام"],["عمق الاستخدام", `${depth}×`, "صفحة لكل جلسة"],["ثقة المدن", confidence, "حسب حجم العينة"]].map(([label,value,hint]) => <div key={String(label)} className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10"><p className="text-[10px] font-black text-white/50">{label}</p><p className="mt-1 text-3xl font-black">{value}</p><p className="text-[9px] font-bold text-white/45">{hint}</p></div>)}</div></div>
    <div className="rounded-[34px] bg-white p-5 shadow-xl ring-1 ring-action/10"><div className="flex items-end justify-between"><div><p className="text-[10px] font-black text-action">CITY MAP</p><h2 className="text-xl font-black">مدن المستخدمين</h2></div><span className="text-xs font-black text-action">{cityTotal} مستخدم</span></div><List rows={data.topCities || []} totalValue={Math.max(1,cityTotal)} /></div>
    <div className="rounded-[34px] bg-white p-5 shadow-xl ring-1 ring-action/10"><div className="flex justify-between"><h2 className="text-xl font-black">الاستخدام والصفحات</h2><span className="text-xs font-black text-action">{pageViews} فتح</span></div><List rows={data.topPages || []} totalValue={Math.max(1,pageViews)} /></div>
    <div className="rounded-[34px] bg-[#F2EBDD] p-5 shadow-lg ring-1 ring-action/10"><div className="flex items-center justify-between"><div><p className="text-[10px] font-black text-action">DECISION LAYER</p><h2 className="text-xl font-black">القرار الآن</h2></div><span className="rounded-full bg-action px-3 py-1 text-[9px] font-black text-white">قرار من البيانات</span></div><p className="mt-4 text-base font-black leading-8">{decision}</p><div className="mt-4 grid grid-cols-3 gap-2"><div className="rounded-2xl bg-white/70 p-3 text-center"><p className="text-xl font-black text-action">{topCity?.name || "—"}</p><p className="text-[9px] font-bold text-secondary-text">أقوى مدينة</p></div><div className="rounded-2xl bg-white/70 p-3 text-center"><p className="text-xl font-black text-action">{topPage?.name || "—"}</p><p className="text-[9px] font-bold text-secondary-text">أقوى صفحة</p></div><div className="rounded-2xl bg-white/70 p-3 text-center"><p className="text-xl font-black text-action">{data.shares || 0}</p><p className="text-[9px] font-bold text-secondary-text">مشاركة</p></div></div></div>
  </section>;
}