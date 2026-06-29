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
      <section className="rounded-[32px] border border-dashed border-action/25 bg-white/80 p-5 shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <div><h2 className="text-lg font-extrabold">Supabase</h2><p className="mt-1 text-xs leading-6 text-secondary-text">{loading ? "جاري قراءة البيانات..." : "لم تصل بيانات Supabase بعد، واللوحة المحلية تعمل كاحتياط."}</p></div>
          <button onClick={reload} className="rounded-full bg-action px-4 py-2 text-xs font-extrabold text-white">تحديث</button>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[32px] bg-white p-5 shadow-xl">
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-sm font-bold text-action">Supabase Live</p><h2 className="text-xl font-extrabold">بيانات كل الزوار</h2><p className="mt-1 text-xs text-secondary-text">آخر 7 أيام من جدول athar_events.</p></div>
        <button onClick={reload} className="rounded-full bg-action px-4 py-2 text-xs font-extrabold text-white">تحديث</button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-primary-bg p-4"><p className="text-xs font-bold text-secondary-text">زيارات اليوم</p><p className="mt-1 text-3xl font-extrabold text-action">{summary.todayVisits}</p></div>
        <div className="rounded-3xl bg-primary-bg p-4"><p className="text-xs font-bold text-secondary-text">المشاركات</p><p className="mt-1 text-3xl font-extrabold text-action">{summary.shares}</p></div>
        <div className="rounded-3xl bg-primary-bg p-4"><p className="text-xs font-bold text-secondary-text">فتح كتطبيق</p><p className="mt-1 text-3xl font-extrabold text-action">{summary.standaloneOpens}</p></div>
        <div className="rounded-3xl bg-primary-bg p-4"><p className="text-xs font-bold text-secondary-text">العميل رقم 1</p><p className="mt-1 text-3xl font-extrabold text-action">{summary.highIntent}</p></div>
      </div>
      <div className="mt-5"><h3 className="mb-3 text-base font-extrabold">أهم الأحداث</h3><Bar rows={summary.topEvents} /></div>
      <div className="mt-5"><h3 className="mb-3 text-base font-extrabold">الأجهزة</h3><Bar rows={summary.devices} /></div>
    </section>
  );
}
