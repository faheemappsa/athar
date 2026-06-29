import { useEffect, useState } from "react";
import { fetchSupabaseAnalyticsSummary } from "../../utils/supabaseAnalytics";

type Row = { name: string; value: number };

const Bar = ({ rows }: { rows: Row[] }) => {
  const safe = rows.length ? rows : [{ name: "لا توجد بيانات بعد", value: 0 }];
  const max = Math.max(1, ...safe.map((row) => row.value));
  return (
    <div className="space-y-3">
      {safe.map((row) => (
        <div key={row.name}>
          <div className="mb-1 flex items-center justify-between text-sm font-bold"><span>{row.name}</span><span>{row.value}</span></div>
          <div className="h-3 rounded-full bg-action/10"><div className="h-3 rounded-full bg-action" style={{ width: `${Math.max(5, (row.value / max) * 100)}%` }} /></div>
        </div>
      ))}
    </div>
  );
};

const Line = ({ rows }: { rows: Row[] }) => {
  const values = rows.map((row) => row.value);
  const max = Math.max(1, ...values);
  const points = values.map((value, index) => `${18 + index * 44},${106 - (value / max) * 78}`).join(" ");
  return (
    <svg viewBox="0 0 310 130" className="h-36 w-full text-action">
      <path d="M18 106H292" stroke="currentColor" strokeOpacity="0.08" strokeWidth="2" />
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      {values.map((value, index) => <circle key={index} cx={18 + index * 44} cy={106 - (value / max) * 78} r="5" fill="currentColor" />)}
    </svg>
  );
};

const Stat = ({ label, value, hint }: { label: string; value: number; hint: string }) => (
  <div className="rounded-[28px] bg-white/90 p-4 shadow-sm shadow-action/5 ring-1 ring-action/10">
    <p className="text-[11px] font-extrabold text-secondary-text">{label}</p>
    <p className="mt-1 text-3xl font-black text-action">{value}</p>
    <p className="mt-1 text-[10px] font-bold text-secondary-text/80">{hint}</p>
  </div>
);

export default function SupabaseReportsPanel() {
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof fetchSupabaseAnalyticsSummary>>>(null);
  const [loading, setLoading] = useState(false);
  const reload = () => {
    setLoading(true);
    fetchSupabaseAnalyticsSummary().then(setSummary).finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
  }, []);

  if (!summary) {
    return (
      <section className="relative overflow-hidden rounded-[34px] border border-dashed border-action/25 bg-white/80 p-5 shadow-lg">
        <div className="absolute -left-10 -top-10 h-28 w-28 rounded-full bg-action/10 blur-2xl" />
        <div className="relative flex items-center justify-between gap-3">
          <div><h2 className="text-lg font-extrabold">غرفة قيادة أثر</h2><p className="mt-1 text-xs leading-6 text-secondary-text">{loading ? "جاري قراءة Supabase..." : "بانتظار أول بيانات من Supabase، واللوحة المحلية تعمل كاحتياط."}</p></div>
          <button onClick={reload} className="rounded-full bg-action px-4 py-2 text-xs font-extrabold text-white">تحديث</button>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-[36px] bg-white p-5 shadow-2xl shadow-action/10 ring-1 ring-action/10">
      <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-action/10 blur-3xl" />
      <div className="absolute right-8 top-8 h-24 w-24 rounded-full bg-mint-soft/80 blur-2xl" />
      <div className="relative flex items-start justify-between gap-3">
        <div><p className="text-sm font-black text-action">Supabase Live</p><h2 className="text-2xl font-black">غرفة قيادة أثر</h2><p className="mt-1 text-xs leading-6 text-secondary-text">قراءة حية لآخر 7 أيام من جدول athar_events.</p></div>
        <button onClick={reload} className="rounded-full bg-action px-4 py-2 text-xs font-extrabold text-white shadow-lg shadow-action/20">تحديث</button>
      </div>

      <div className="relative mt-5 grid grid-cols-2 gap-3">
        <Stat label="إجمالي الأحداث" value={summary.totalEvents} hint="آخر 7 أيام" />
        <Stat label="زيارات اليوم" value={summary.todayVisits} hint="كل الزوار" />
        <Stat label="المشاركات" value={summary.shares} hint="Share events" />
        <Stat label="فتح كتطبيق" value={summary.standaloneOpens} hint="PWA" />
        <Stat label="العميل رقم 1" value={summary.highIntent} hint="High intent" />
      </div>

      <div className="relative mt-5 rounded-[30px] bg-primary-bg p-4">
        <div className="flex items-center justify-between"><h3 className="text-base font-black">نبض النشاط</h3><span className="text-xs font-bold text-secondary-text">7 أيام</span></div>
        <Line rows={summary.trend} />
      </div>

      <div className="relative mt-5 grid gap-4">
        <div className="rounded-[30px] bg-primary-bg p-4"><h3 className="mb-3 text-base font-black">أكثر الصفحات زيارة</h3><Bar rows={summary.topPages || []} /></div>
        <div className="rounded-[30px] bg-primary-bg p-4"><h3 className="mb-3 text-base font-black">أهم الأحداث</h3><Bar rows={summary.topEvents} /></div>
        <div className="rounded-[30px] bg-primary-bg p-4"><h3 className="mb-3 text-base font-black">الأجهزة</h3><Bar rows={summary.devices} /></div>
      </div>
    </section>
  );
}
