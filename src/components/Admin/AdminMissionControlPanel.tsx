import { useEffect, useState } from "react";
import { fetchSupabaseAnalyticsSummary } from "../../utils/supabaseAnalytics";

type Summary = NonNullable<Awaited<ReturnType<typeof fetchSupabaseAnalyticsSummary>>>;
type Row = { name: string; value: number };

const total = (rows: Row[] = []) => rows.reduce((sum, row) => sum + row.value, 0);
const pct = (value: number, sum: number) => sum ? Math.round((value / sum) * 100) : 0;

const Stat = ({ label, value, hint }: { label: string; value: string | number; hint: string }) => (
  <div className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-action/10">
    <p className="text-[11px] font-black text-secondary-text">{label}</p>
    <p className="mt-1 text-3xl font-black text-action">{value}</p>
    <p className="mt-1 text-[10px] font-bold leading-5 text-secondary-text">{hint}</p>
  </div>
);

const Bars = ({ rows }: { rows: Row[] }) => {
  const safe = rows.length ? rows : [{ name: "لا توجد بيانات", value: 0 }];
  const max = Math.max(1, ...safe.map((row) => row.value));
  const sum = Math.max(1, total(safe));
  return <div className="space-y-3">{safe.map((row) => <div key={row.name}>
    <div className="mb-1 flex justify-between text-sm font-bold"><span>{row.name}</span><span>{row.value} • {pct(row.value, sum)}%</span></div>
    <div className="h-3 rounded-full bg-action/10"><div className="h-3 rounded-full bg-action" style={{ width: `${Math.max(5, row.value / max * 100)}%` }} /></div>
  </div>)}</div>;
};

export default function AdminMissionControlPanel() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [updated, setUpdated] = useState("");

  const reload = () => {
    setLoading(true);
    fetchSupabaseAnalyticsSummary().then((data) => {
      setSummary(data);
      setUpdated(new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }));
    }).finally(() => setLoading(false));
  };

  useEffect(() => reload(), []);
  if (!summary) return null;

  const visitorsToday = summary.todayVisitors || summary.todayVisits || 0;
  const sessionsToday = summary.todaySessions || summary.todayVisits || 0;
  const cityCount7d = total(summary.topCities || []);
  const pageViews7d = total(summary.topPages || []);
  const topCity = summary.topCities?.[0];
  const topPage = summary.topPages?.[0];
  const topPageShare = topPage ? pct(topPage.value, pageViews7d) : 0;

  return <section className="space-y-4">
    <div className="rounded-[36px] bg-[#1E1B18] p-5 text-white shadow-2xl">
      <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black text-white/55">Mission Control</p><h2 className="mt-1 text-3xl font-black">غرفة قيادة أثر</h2><p className="mt-2 text-xs font-bold leading-6 text-white/60">فصل واضح بين بيانات اليوم ونافذة آخر 7 أيام.</p></div><button onClick={reload} disabled={loading} className="rounded-full bg-white px-4 py-2 text-xs font-black text-[#1E1B18]">{loading ? "..." : "تحديث"}</button></div>
      <div className="mt-5 grid grid-cols-2 gap-3"><div><p className="text-xs text-white/60">مؤشر النشاط الداخلي</p><p className="text-3xl font-black">{summary.healthScore || 0}/100</p></div><div><p className="text-xs text-white/60">آخر تحديث</p><p className="text-2xl font-black">{updated || "الآن"}</p></div></div>
    </div>

    <div className="grid grid-cols-2 gap-3">
      <Stat label="زوار اليوم" value={visitorsToday} hint="أجهزة فريدة تقريبًا • اليوم" />
      <Stat label="جلسات اليوم" value={sessionsToday} hint="جلسات فريدة تقريبًا • اليوم" />
      <Stat label="أكثر مدينة" value={topCity?.name || "غير واضح"} hint={`${topCity?.value || 0} زائر مؤكد • 7 أيام`} />
      <Stat label="أكثر صفحة" value={topPage?.name || "غير واضح"} hint={`${topPage?.value || 0} فتح • 7 أيام`} />
      <Stat label="أحداث المشاركة" value={summary.shares || 0} hint="عداد أحداث • 7 أيام" />
      <Stat label="فتح كتطبيق" value={summary.standaloneOpens || 0} hint="مرات فتح PWA • 7 أيام" />
    </div>

    <div className="rounded-[34px] bg-white p-5 shadow-xl ring-1 ring-action/10">
      <h3 className="text-xl font-black">ثقة البيانات</h3>
      <p className="mt-1 text-xs font-bold leading-6 text-secondary-text">ألغينا النسب التي كانت تقسم أرقام 7 أيام على زوار أو جلسات اليوم.</p>
      <div className="mt-4 grid grid-cols-2 gap-3"><Stat label="مدن مؤكدة" value={cityCount7d} hint="عينة جغرافية • 7 أيام" /><Stat label="فتحات الصفحات" value={pageViews7d} hint="Page views • 7 أيام" /></div>
    </div>

    <div className="rounded-[34px] bg-white p-5 shadow-xl ring-1 ring-action/10">
      <h3 className="text-xl font-black">قراءة قابلة للتنفيذ</h3>
      <div className="mt-4 grid gap-2 text-xs font-bold leading-6 text-secondary-text">
        <p className="rounded-2xl bg-primary-bg p-3">{cityCount7d < 20 ? `العينة الجغرافية صغيرة (${cityCount7d})؛ لا نبني قرارًا حسب المدن الآن.` : `${topCity?.name} الأعلى ضمن المدن المؤكدة بعدد ${topCity?.value}.`}</p>
        <p className="rounded-2xl bg-primary-bg p-3">{topPage ? `${topPage.name} تمثل ${topPageShare}% من فتحات الصفحات خلال آخر 7 أيام.` : "لا توجد بيانات صفحات كافية."}</p>
        <p className="rounded-2xl bg-primary-bg p-3">المشاركة وفتح PWA معروضان كعدادات فقط؛ لا توجد نسبة تحويل صحيحة قبل توحيد المقام والفترة.</p>
      </div>
    </div>

    <div className="rounded-[34px] bg-white p-5 shadow-xl ring-1 ring-action/10"><h3 className="mb-1 text-lg font-black">كل المدن • 7 أيام</h3><p className="mb-3 text-[11px] font-bold text-secondary-text">الزوار ذوو المدينة المؤكدة فقط.</p><Bars rows={summary.topCities || []} /></div>
    <div className="rounded-[34px] bg-white p-5 shadow-xl ring-1 ring-action/10"><h3 className="mb-1 text-lg font-black">كل الصفحات • 7 أيام</h3><p className="mb-3 text-[11px] font-bold text-secondary-text">فتحات صفحات، وليست مستخدمين فريدين.</p><Bars rows={summary.topPages || []} /></div>
    <div className="rounded-[34px] bg-white p-5 shadow-xl ring-1 ring-action/10"><h3 className="mb-1 text-lg font-black">أهم الأحداث • 7 أيام</h3><p className="mb-3 text-[11px] font-bold text-secondary-text">المستخدم الواحد قد ينفذ الحدث أكثر من مرة.</p><Bars rows={summary.topEvents || []} /></div>
  </section>;
}