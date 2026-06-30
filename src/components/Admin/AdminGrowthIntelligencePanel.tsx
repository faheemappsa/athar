import { useEffect, useMemo, useState } from "react";
import { fetchSupabaseAnalyticsSummary } from "../../utils/supabaseAnalytics";

type Summary = NonNullable<Awaited<ReturnType<typeof fetchSupabaseAnalyticsSummary>>>;
type SignalTone = "strong" | "watch" | "neutral";

const pct = (value: number, total: number) => (total > 0 ? Math.round((value / total) * 100) : 0);

const signalClass: Record<SignalTone, string> = {
  strong: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  watch: "bg-amber-50 text-amber-800 ring-amber-200",
  neutral: "bg-white text-secondary-text ring-action/10",
};

const IntelligenceCard = ({ title, value, hint, tone }: { title: string; value: string; hint: string; tone: SignalTone }) => (
  <div className={`rounded-[26px] p-4 ring-1 ${signalClass[tone]}`}>
    <p className="text-[11px] font-black opacity-80">{title}</p>
    <p className="mt-1 text-2xl font-black">{value}</p>
    <p className="mt-1 text-[11px] font-bold leading-5 opacity-80">{hint}</p>
  </div>
);

const ActionItem = ({ label, detail, tone }: { label: string; detail: string; tone: SignalTone }) => (
  <div className={`rounded-2xl px-3 py-3 ring-1 ${signalClass[tone]}`}>
    <p className="text-xs font-black">{label}</p>
    <p className="mt-1 text-[11px] font-bold leading-5 opacity-80">{detail}</p>
  </div>
);

const getTopName = (rows?: Array<{ name: string; value: number }>) => rows?.[0]?.name || "غير واضح";
const getTopValue = (rows?: Array<{ name: string; value: number }>) => rows?.[0]?.value || 0;

const buildReadout = (summary: Summary) => {
  const visitors = summary.todayVisitors || summary.todayVisits || 0;
  const sessions = summary.todaySessions || summary.todayVisits || 0;
  const shares = summary.shares || 0;
  const pwa = summary.standaloneOpens || 0;
  const cities = summary.topCities || [];
  const pages = summary.topPages || [];
  const events = summary.topEvents || [];
  const shareRate = pct(shares, sessions);
  const pwaRate = pct(pwa, visitors);
  const cityCoverage = pct(cities.reduce((sum, row) => sum + row.value, 0), Math.max(1, visitors));
  const topCity = getTopName(cities);
  const topPage = getTopName(pages);
  const topEvent = getTopName(events);
  const topCityValue = getTopValue(cities);

  const actions = [
    cityCoverage < 50
      ? { label: "ارفع وضوح المدن", detail: "ادفع المستخدم لتحديث الموقع من بطاقة الصلاة؛ المدن الآن تحتاج إشارات GPS أكثر.", tone: "watch" as const }
      : { label: "المدن قابلة للقراءة", detail: `أقوى مدينة الآن: ${topCity} (${topCityValue}). راقب هل هي منطقية بعد اختبارك.`, tone: "strong" as const },
    shareRate < 20
      ? { label: "المشاركة تحتاج دفعة", detail: "إذا الجلسات تزيد والمشاركة منخفضة، ركز على بطاقة الإنجاز وأثر اليوم كرافعة انتشار.", tone: "watch" as const }
      : { label: "المشاركة جيدة", detail: `معدل المشاركة التقريبي ${shareRate}% من الجلسات. هذا مؤشر قابل للتوسع.`, tone: "strong" as const },
    pwaRate < 20
      ? { label: "PWA يحتاج متابعة", detail: "فتح كتطبيق منخفض؛ راقب هل المستخدم يرى دعوة التثبيت بوضوح بعد التجربة.", tone: "neutral" as const }
      : { label: "استخدام التطبيق قوي", detail: `فتح كتطبيق يعادل تقريبًا ${pwaRate}% من زوار اليوم.`, tone: "strong" as const },
  ];

  const verdict = sessions === 0
    ? "بانتظار بيانات كافية"
    : shareRate >= 20 && cityCoverage >= 50
      ? "الوضع صحي وقابل للتوسع"
      : "يوجد فرص تحسين واضحة";

  return { visitors, sessions, shares, pwa, shareRate, pwaRate, cityCoverage, topCity, topPage, topEvent, actions, verdict };
};

export default function AdminGrowthIntelligencePanel() {
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    fetchSupabaseAnalyticsSummary().then((next) => setSummary(next));
  }, []);

  const readout = useMemo(() => (summary ? buildReadout(summary) : null), [summary]);

  if (!summary || !readout) return null;

  return (
    <section className="overflow-hidden rounded-[34px] bg-[#1E1B18] p-5 text-white shadow-2xl ring-1 ring-white/10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black text-white/60">Mission Control</p>
          <h2 className="mt-1 text-2xl font-black">قراءة النمو</h2>
          <p className="mt-2 text-xs font-bold leading-6 text-white/65">لوحة قرار: ما الذي يحدث؟ وما الذي يستحق المعالجة؟</p>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black text-white">{readout.verdict}</span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <IntelligenceCard title="ثقة المدن" value={`${readout.cityCoverage}%`} hint={`الأقوى: ${readout.topCity}`} tone={readout.cityCoverage >= 50 ? "strong" : "watch"} />
        <IntelligenceCard title="قابلية الانتشار" value={`${readout.shareRate}%`} hint="مشاركة / جلسات" tone={readout.shareRate >= 20 ? "strong" : "watch"} />
        <IntelligenceCard title="اعتماد التطبيق" value={`${readout.pwaRate}%`} hint="فتح كتطبيق / زوار" tone={readout.pwaRate >= 20 ? "strong" : "neutral"} />
        <IntelligenceCard title="أقوى صفحة" value={readout.topPage} hint={`أبرز حدث: ${readout.topEvent}`} tone="neutral" />
      </div>

      <div className="mt-5 rounded-[28px] bg-white/8 p-4 ring-1 ring-white/10">
        <h3 className="text-sm font-black">أولويات التنفيذ</h3>
        <div className="mt-3 grid gap-2">
          {readout.actions.map((item) => (
            <ActionItem key={item.label} label={item.label} detail={item.detail} tone={item.tone} />
          ))}
        </div>
      </div>
    </section>
  );
}
