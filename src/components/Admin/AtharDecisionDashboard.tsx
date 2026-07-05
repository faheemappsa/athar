import { useEffect, useState } from "react";
import { fetchSupabaseAnalyticsSummary } from "../../utils/supabaseAnalytics";

type Summary = NonNullable<Awaited<ReturnType<typeof fetchSupabaseAnalyticsSummary>>>;
type Row = { name: string; value: number };
const total = (rows: Row[] = []) => rows.reduce((n, row) => n + row.value, 0);
const rate = (n: number, d: number) => d > 0 ? Math.round((n / d) * 100) : 0;

function Trend({ rows }: { rows: Row[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return <div className="mt-4 flex h-28 items-end gap-2">{rows.map((r) => <div key={r.name} className="flex h-full flex-1 flex-col justify-end gap-2"><div className="mx-auto w-full rounded-t-xl bg-action" style={{ height: `${Math.max(8, (r.value / max) * 88)}%` }} /><span className="text-center text-[8px] font-bold text-secondary-text">{r.name.replace("قبل ", "-")}</span></div>)}</div>;
}

export default function AtharDecisionDashboard() {
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const load = () => { setLoading(true); fetchSupabaseAnalyticsSummary().then(setData).finally(() => setLoading(false)); };
  useEffect(load, []);
  if (!data) return <div className="rounded-[32px] bg-white p-6 text-center font-bold">جاري قراءة البيانات...</div>;

  const visitors = data.periodVisitors || 0;
  const sessions = data.periodSessions || 0;
  const pageViews = total(data.topPages || []);
  const depth = sessions ? (pageViews / sessions).toFixed(1) : "0";
  const shareRate = rate(data.shareUsers || 0, visitors);
  const topPage = data.topPages?.[0];
  const topShare = topPage ? rate(topPage.value, pageViews) : 0;
  const decision = visitors < 20 ? "العينة ما زالت صغيرة؛ نواصل القياس قبل قرار تطوير كبير." : shareRate >= 10 ? "المشاركة هي إشارة النمو الأقوى؛ الأولوية لتحسين مسار المشاركة وقياس مصدرها." : Number(depth) >= 2 ? "التفاعل داخل التطبيق جيد؛ الأولوية الآن لقياس العودة D1 وD7." : "الأولوية لتحسين الوصول إلى القيمة الأساسية قبل إضافة مزايا جديدة.";

  return <section className="space-y-4">
    <div className="rounded-[38px] bg-[#1E1B18] p-5 text-white shadow-2xl">
      <div className="flex items-start justify-between"><div><p className="text-[10px] font-black tracking-widest text-white/40">ATHAR · EXECUTIVE PULSE</p><h1 className="mt-2 text-3xl font-black">نبض أثر</h1><p className="mt-1 text-xs font-bold text-white/50">آخر 7 أيام · قراءة موحدة</p></div><button onClick={load} className="rounded-full bg-white/10 px-4 py-2 text-[11px] font-black ring-1 ring-white/15">{loading ? "..." : "تحديث"}</button></div>
      <div className="mt-5 grid grid-cols-2 gap-2">{[["الزوار", visitors, "مستخدم فريد تقريبي"],["الجلسات", sessions, "جلسة فريدة"],["عمق الاستخدام", `${depth}×`, "صفحة لكل جلسة"],["معدل المشاركين", `${shareRate}%`, `${data.shareUsers || 0} مستخدم شارك`]].map(([label,value,hint]) => <div key={String(label)} className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10"><p className="text-[10px] font-black text-white/50">{label}</p><p className="mt-1 text-3xl font-black">{value}</p><p className="text-[9px] font-bold text-white/45">{hint}</p></div>)}</div>
      <p className="mt-4 border-t border-white/10 pt-3 text-[9px] font-bold text-white/35">Supabase · Live · مستخدمون + جلسات + أحداث</p>
    </div>

    <div className="rounded-[34px] bg-white p-5 shadow-xl ring-1 ring-action/10">
      <div className="flex items-end justify-between"><div><p className="text-[10px] font-black text-action">TRACTION</p><h2 className="text-xl font-black">الحركة والقيمة</h2></div><div className="text-left"><p className="text-2xl font-black text-action">{sessions}</p><p className="text-[9px] font-bold text-secondary-text">جلسة / 7 أيام</p></div></div>
      <Trend rows={data.trend || []} />
      <div className="mt-5 border-t border-action/10 pt-4"><div className="flex justify-between"><h3 className="text-lg font-black">أين يذهب الاستخدام؟</h3><span className="text-xs font-black text-action">{pageViews} فتح</span></div><div className="mt-3 space-y-3">{(data.topPages || []).slice(0,4).map((row) => <div key={row.name}><div className="flex justify-between text-xs font-black"><span>{row.name}</span><span>{row.value} · {rate(row.value,pageViews)}%</span></div><div className="mt-1 h-2 rounded-full bg-action/10"><div className="h-2 rounded-full bg-action" style={{ width: `${Math.max(5,rate(row.value,pageViews))}%` }} /></div></div>)}</div></div>
    </div>

    <div className="rounded-[34px] bg-[#F2EBDD] p-5 shadow-lg ring-1 ring-action/10">
      <div className="flex items-center justify-between"><div><p className="text-[10px] font-black text-action">DECISION LAYER</p><h2 className="text-xl font-black">القرار الآن</h2></div><span className="rounded-full bg-action px-3 py-1 text-[9px] font-black text-white">قرار من البيانات</span></div>
      <p className="mt-4 text-base font-black leading-8">{decision}</p>
      <div className="mt-4 grid grid-cols-3 gap-2"><div className="rounded-2xl bg-white/70 p-3 text-center"><p className="text-xl font-black text-action">{topShare}%</p><p className="text-[9px] font-bold text-secondary-text">حصة {topPage?.name || "الأعلى"}</p></div><div className="rounded-2xl bg-white/70 p-3 text-center"><p className="text-xl font-black text-action">{data.shares || 0}</p><p className="text-[9px] font-bold text-secondary-text">مشاركة ناجحة</p></div><div className="rounded-2xl bg-white/70 p-3 text-center"><p className="text-xl font-black text-action">{data.pwaUsers || 0}</p><p className="text-[9px] font-bold text-secondary-text">مستخدم PWA</p></div></div>
    </div>
  </section>;
}