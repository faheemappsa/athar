import { useEffect, useMemo, useState } from "react";
import { fetchSupabaseAnalyticsSummary } from "../../utils/supabaseAnalytics";

type Summary = NonNullable<Awaited<ReturnType<typeof fetchSupabaseAnalyticsSummary>>>;
type Row = { name: string; value: number };
type Tone = "good" | "warn" | "calm" | "dark";

const pct = (value: number, total: number) => (total > 0 ? Math.round((value / total) * 100) : 0);
const topName = (rows?: Row[]) => rows?.[0]?.name || "غير واضح";
const topValue = (rows?: Row[]) => rows?.[0]?.value || 0;

const toneClass: Record<Tone, string> = {
  good: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  warn: "bg-amber-50 text-amber-800 ring-amber-200",
  calm: "bg-white text-primary-text ring-action/10",
  dark: "bg-[#1E1B18] text-white ring-white/10",
};

const Stat = ({ label, value, hint, tone = "calm" }: { label: string; value: string | number; hint: string; tone?: Tone }) => (
  <div className={`rounded-[28px] p-4 shadow-sm ring-1 ${toneClass[tone]}`}>
    <p className="text-[11px] font-black opacity-70">{label}</p>
    <p className="mt-1 text-3xl font-black">{value}</p>
    <p className="mt-1 text-[10px] font-bold leading-5 opacity-75">{hint}</p>
  </div>
);

const Bar = ({ rows }: { rows: Row[] }) => {
  const safe = rows.length ? rows : [{ name: "لا توجد بيانات", value: 0 }];
  const max = Math.max(1, ...safe.map((row) => row.value));
  return (
    <div className="space-y-3">
      {safe.slice(0, 5).map((row) => (
        <div key={row.name}>
          <div className="mb-1 flex items-center justify-between text-sm font-bold">
            <span>{row.name}</span>
            <span>{row.value}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-action/10">
            <div className="h-full rounded-full bg-action" style={{ width: `${Math.max(5, (row.value / max) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
};

const Insight = ({ title, detail, tone }: { title: string; detail: string; tone: Tone }) => (
  <div className={`rounded-2xl px-3 py-3 ring-1 ${toneClass[tone]}`}>
    <p className="text-xs font-black">{title}</p>
    <p className="mt-1 text-[11px] font-bold leading-5 opacity-75">{detail}</p>
  </div>
);

const calc = (summary: Summary) => {
  const visitors = summary.todayVisitors || summary.todayVisits || 0;
  const sessions = summary.todaySessions || summary.todayVisits || 0;
  const pageViews = summary.todayVisits || 0;
  const shares = summary.shares || 0;
  const pwa = summary.standaloneOpens || 0;
  const installs = summary.installs || 0;
  const cityHits = (summary.topCities || []).reduce((sum, row) => sum + row.value, 0);
  const shareRate = pct(shares, sessions);
  const pwaRate = pct(pwa, visitors);
  const cityConfidence = pct(cityHits, Math.max(1, visitors));
  const pagesPerSession = sessions ? Math.round((pageViews / sessions) * 10) / 10 : 0;
  const topCity = topName(summary.topCities);
  const topPage = topName(summary.topPages);
  const topEvent = topName(summary.topEvents);
  const topCityCount = topValue(summary.topCities);

  const growthScore = Math.min(100, Math.round((Math.min(30, sessions * 8) + Math.min(25, shareRate) + Math.min(20, pwaRate) + Math.min(25, cityConfidence))));

  const insights = [
    cityConfidence < 50
      ? { title: "المدن تحتاج بيانات أكثر", detail: "أي زائر لا يحدّث الموقع يبقى استخدامه محسوبًا لكن مدينته غير مؤكدة.", tone: "warn" as const }
      : { title: "المدن قابلة للقراءة", detail: `أقوى مدينة الآن: ${topCity} (${topCityCount}). راقبها بعد اختبار GPS الجديد.`, tone: "good" as const },
    shareRate < 20
      ? { title: "فرصة انتشار", detail: "المشاركة أقل من المطلوب. راقب أثر اليوم وبطاقة الإنجاز لأنها أقوى نقاط الانتشار.", tone: "warn" as const }
      : { title: "المشاركة جيدة", detail: `معدل المشاركة التقريبي ${shareRate}% من الجلسات.`, tone: "good" as const },
    pwaRate < 20
      ? { title: "التثبيت يحتاج دفع", detail: "فتح كتطبيق منخفض. اختبر وضوح دعوة التثبيت وسهولة الرجوع للتطبيق.", tone: "calm" as const }
      : { title: "اعتماد التطبيق جيد", detail: `فتح كتطبيق يعادل ${pwaRate}% تقريبًا من زوار اليوم.`, tone: "good" as const },
  ];

  return { visitors, sessions, pageViews, shares, pwa, installs, shareRate, pwaRate, cityConfidence, pagesPerSession, topCity, topPage, topEvent, growthScore, insights };
};

export default function AdminMissionControlPanel() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");

  const reload = () => {
    setLoading(true);
    fetchSupabaseAnalyticsSummary()
      .then((next) => {
        setSummary(next);
        setLastUpdated(new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => reload(), []);

  const readout = useMemo(() => (summary ? calc(summary) : null), [summary]);

  if (!summary || !readout) {
    return (
      <section className="rounded-[34px] bg-white p-5 shadow-xl ring-1 ring-action/10">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black">غرفة قيادة أثر</h2>
            <p className="mt-1 text-xs font-bold text-secondary-text">{loading ? "جاري قراءة البيانات..." : "بانتظار البيانات."}</p>
          </div>
          <button onClick={reload} disabled={loading} className="rounded-full bg-action px-4 py-2 text-xs font-black text-white disabled:opacity-60">تحديث</button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="overflow-hidden rounded-[36px] bg-[#1E1B18] p-5 text-white shadow-2xl ring-1 ring-white/10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black text-white/55">Mission Control</p>
            <h2 className="mt-1 text-3xl font-black">غرفة قيادة أثر</h2>
            <p className="mt-2 text-xs font-bold leading-6 text-white/60">قرار سريع مبني على الزوار، الجلسات، المدن، الانتشار، واعتماد التطبيق.</p>
          </div>
          <button onClick={reload} disabled={loading} className="rounded-full bg-white px-4 py-2 text-xs font-black text-[#1E1B18] disabled:opacity-60">{loading ? "..." : "تحديث"}</button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Stat label="مؤشر النمو" value={`${readout.growthScore}/100`} hint="قراءة عامة للصحة" tone="dark" />
          <Stat label="آخر تحديث" value={lastUpdated || "الآن"} hint="Supabase live" tone="dark" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="زوار اليوم" value={readout.visitors} hint="أجهزة فريدة تقريبًا" />
        <Stat label="جلسات اليوم" value={readout.sessions} hint="استخدام فعلي" />
        <Stat label="مشاركة" value={`${readout.shareRate}%`} hint={`${readout.shares} حدث مشاركة`} tone={readout.shareRate >= 20 ? "good" : "warn"} />
        <Stat label="فتح كتطبيق" value={`${readout.pwaRate}%`} hint={`${readout.pwa} فتح PWA`} tone={readout.pwaRate >= 20 ? "good" : "calm"} />
      </div>

      <div className="rounded-[34px] bg-white p-5 shadow-xl ring-1 ring-action/10">
        <h3 className="text-xl font-black">ثقة البيانات</h3>
        <p className="mt-1 text-xs font-bold leading-6 text-secondary-text">هنا نحدد هل الرقم صالح لاتخاذ قرار أو يحتاج بيانات أكثر.</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Stat label="ثقة المدن" value={`${readout.cityConfidence}%`} hint={`الأقوى: ${readout.topCity}`} tone={readout.cityConfidence >= 50 ? "good" : "warn"} />
          <Stat label="صفحات/جلسة" value={readout.pagesPerSession} hint="عمق الاستخدام" />
        </div>
      </div>

      <div className="rounded-[34px] bg-white p-5 shadow-xl ring-1 ring-action/10">
        <h3 className="text-xl font-black">أولويات التنفيذ</h3>
        <div className="mt-4 grid gap-2">
          {readout.insights.map((item) => <Insight key={item.title} title={item.title} detail={item.detail} tone={item.tone} />)}
        </div>
      </div>

      <div className="grid gap-4">
        <div className="rounded-[34px] bg-white p-5 shadow-xl ring-1 ring-action/10">
          <h3 className="mb-3 text-lg font-black">المدن</h3>
          <Bar rows={summary.topCities || []} />
        </div>
        <div className="rounded-[34px] bg-white p-5 shadow-xl ring-1 ring-action/10">
          <h3 className="mb-3 text-lg font-black">أكثر الصفحات</h3>
          <Bar rows={summary.topPages || []} />
        </div>
        <div className="rounded-[34px] bg-white p-5 shadow-xl ring-1 ring-action/10">
          <h3 className="mb-3 text-lg font-black">أهم الأحداث</h3>
          <Bar rows={summary.topEvents || []} />
        </div>
      </div>
    </section>
  );
}
