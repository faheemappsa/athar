import { useEffect, useState } from "react";
import { normalizeAdminReportAccuracy } from "../../utils/adminReportAccuracy";
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
    <svg viewBox="0 0 310 130" className="h-32 w-full text-action">
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

const LiveNow = ({ activeNow, lastActivity, activeCities }: { activeNow: number; lastActivity: string; activeCities: Row[] }) => (
  <div className="relative mt-5 overflow-hidden rounded-[30px] bg-primary-bg p-4 ring-1 ring-action/10">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-extrabold text-secondary-text">الآن داخل أثر</p>
        <h3 className="mt-1 text-4xl font-black text-action">{activeNow}</h3>
        <p className="mt-1 text-xs leading-5 text-secondary-text">آخر نشاط: {lastActivity}</p>
      </div>
      <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-action shadow-sm">آخر 5 دقائق</span>
    </div>
    <div className="mt-4 flex flex-wrap gap-2">
      {(activeCities.length ? activeCities : [{ name: "لا توجد مدينة نشطة الآن", value: 0 }]).slice(0, 3).map((city) => (
        <span key={city.name} className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-secondary-text shadow-sm">{city.name} {city.value ? `• ${city.value}` : ""}</span>
      ))}
    </div>
  </div>
);

const Health = ({ value }: { value: number }) => (
  <div className="relative mt-5 overflow-hidden rounded-[30px] bg-primary-bg p-4 ring-1 ring-action/10">
    <div className="relative flex items-center justify-between gap-4">
      <div>
        <p className="text-xs font-extrabold text-secondary-text">مؤشر صحة أثر</p>
        <h3 className="mt-1 text-3xl font-black text-action">{value}/100</h3>
        <p className="mt-1 text-xs leading-5 text-secondary-text">النشاط، المشاركة، الفتح كتطبيق، والولاء.</p>
      </div>
      <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-white shadow-inner ring-8 ring-action/10">
        <span className="text-xl font-black text-action">{value}</span>
      </div>
    </div>
    <div className="relative mt-4 h-3 rounded-full bg-white"><div className="h-3 rounded-full bg-action" style={{ width: `${value}%` }} /></div>
  </div>
);

const InstallCard = ({ installs, opens, conversion }: { installs: number; opens: number; conversion: number }) => (
  <div className="rounded-[30px] bg-primary-bg p-4 ring-1 ring-action/10">
    <div className="mb-3 flex items-center justify-between"><h3 className="text-base font-black">التطبيق المثبت</h3><span className="rounded-full bg-white px-3 py-1 text-xs font-black text-action">{conversion}%</span></div>
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-2xl bg-white/80 p-3"><p className="text-xs font-bold text-secondary-text">تثبيت مؤكد</p><p className="mt-1 text-2xl font-black text-action">{installs}</p></div>
      <div className="rounded-2xl bg-white/80 p-3"><p className="text-xs font-bold text-secondary-text">فتح كتطبيق</p><p className="mt-1 text-2xl font-black text-action">{opens}</p></div>
    </div>
    <p className="mt-3 text-xs leading-5 text-secondary-text">فتح التطبيق بوضع PWA يعني أنه يعمل من الشاشة الرئيسية.</p>
  </div>
);

const Funnel = ({ rows }: { rows: Row[] }) => {
  const safe = rows.length ? rows : [{ name: "لا توجد بيانات", value: 0 }];
  const max = Math.max(1, ...safe.map((row) => row.value));
  return (
    <div className="rounded-[30px] bg-primary-bg p-4">
      <h3 className="mb-3 text-base font-black">مسار التحول</h3>
      <div className="space-y-3">
        {safe.map((row) => (
          <div key={row.name}>
            <div className="mb-1 flex items-center justify-between text-sm font-bold"><span>{row.name}</span><span>{row.value}</span></div>
            <div className="h-3 rounded-full bg-action/10"><div className="h-3 rounded-full bg-action" style={{ width: `${Math.max(5, (row.value / max) * 100)}%` }} /></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function SupabaseReportsPanel() {
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof fetchSupabaseAnalyticsSummary>>>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");

  const reload = () => {
    setLoading(true);
    fetchSupabaseAnalyticsSummary()
      .then((nextSummary) => {
        setSummary(normalizeAdminReportAccuracy(nextSummary));
        setLastUpdated(new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
  }, []);

  if (!summary) {
    return (
      <section className="relative overflow-hidden rounded-[34px] border border-dashed border-action/25 bg-white/80 p-5 shadow-lg">
        <div className="relative flex items-center justify-between gap-3">
          <div><h2 className="text-lg font-extrabold">غرفة قيادة أثر</h2><p className="mt-1 text-xs leading-6 text-secondary-text">{loading ? "جاري قراءة Supabase..." : "بانتظار أول بيانات."}</p></div>
          <button disabled={loading} onClick={reload} className="rounded-full bg-action px-4 py-2 text-xs font-extrabold text-white disabled:opacity-60">{loading ? "جاري..." : "تحديث"}</button>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-[36px] bg-white p-5 shadow-2xl shadow-action/10 ring-1 ring-action/10">
      <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-action/10 blur-3xl" />
      <div className="absolute right-8 top-8 h-24 w-24 rounded-full bg-mint-soft/80 blur-2xl" />
      <div className="relative flex items-start justify-between gap-3">
        <div><p className="text-sm font-black text-action">Supabase Live</p><h2 className="text-2xl font-black">غرفة قيادة أثر</h2><p className="mt-1 text-xs leading-6 text-secondary-text">{loading ? "جاري جلب أحدث البيانات..." : `آخر تحديث: ${lastUpdated || "الآن"}`}</p></div>
        <button disabled={loading} onClick={reload} className="rounded-full bg-action px-4 py-2 text-xs font-extrabold text-white shadow-lg shadow-action/20 disabled:opacity-60">{loading ? "جاري..." : "تحديث"}</button>
      </div>

      <LiveNow activeNow={summary.activeNow || 0} lastActivity={summary.lastActivity || "لا يوجد نشاط الآن"} activeCities={summary.activeCities || []} />
      <Health value={summary.healthScore || 0} />

      <div className="relative mt-5 grid grid-cols-2 gap-3">
        <Stat label="زيارات اليوم" value={summary.todayVisits} hint="كل الزوار" />
        <Stat label="العميل رقم 1" value={summary.highIntent} hint="تفاعل عالي" />
        <Stat label="المشاركات" value={summary.shares} hint="أحداث المشاركة" />
        <Stat label="فتح كتطبيق" value={summary.standaloneOpens} hint="PWA" />
      </div>

      <div className="relative mt-5 grid gap-4">
        <InstallCard installs={summary.installs || 0} opens={summary.standaloneOpens || 0} conversion={summary.installConversion || 0} />
        <Funnel rows={summary.funnel || []} />
        <div className="rounded-[30px] bg-primary-bg p-4"><h3 className="mb-1 text-base font-black">المدن</h3><p className="mb-3 text-[11px] font-bold leading-5 text-secondary-text">تظهر المدينة بعد تحديث مواقيت الصلاة ثم تسجيل نشاط جديد.</p><Bar rows={summary.topCities || []} /></div>
        <div className="rounded-[30px] bg-primary-bg p-4"><h3 className="mb-3 text-base font-black">أكثر الصفحات</h3><Bar rows={summary.topPages || []} /></div>
        <div className="rounded-[30px] bg-primary-bg p-4"><div className="flex items-center justify-between"><h3 className="text-base font-black">نبض النشاط</h3><span className="text-xs font-bold text-secondary-text">7 أيام</span></div><Line rows={summary.trend} /></div>
      </div>
    </section>
  );
}