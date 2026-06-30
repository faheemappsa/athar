import { fetchSupabaseAnalyticsSummary } from "../../utils/supabaseAnalytics";

type Summary = NonNullable<Awaited<ReturnType<typeof fetchSupabaseAnalyticsSummary>>>;
type Tone = "good" | "watch" | "neutral";

type QualityItem = {
  label: string;
  status: string;
  hint: string;
  tone: Tone;
};

const toneClass: Record<Tone, string> = {
  good: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  watch: "bg-amber-50 text-amber-700 ring-amber-200",
  neutral: "bg-white text-secondary-text ring-action/10",
};

const QualityBadge = ({ item }: { item: QualityItem }) => (
  <div className={`rounded-2xl px-3 py-2 ring-1 ${toneClass[item.tone]}`}>
    <div className="flex items-center justify-between gap-2">
      <p className="text-[11px] font-black">{item.label}</p>
      <span className="text-[10px] font-black">{item.status}</span>
    </div>
    <p className="mt-1 text-[10px] font-bold leading-5 opacity-80">{item.hint}</p>
  </div>
);

export default function AdminDataQualityPanel({ summary }: { summary: Summary }) {
  const hasRealVisitors = Boolean(summary.todayVisitors);
  const hasRealSessions = Boolean(summary.todaySessions);
  const hasCities = Boolean(summary.topCities?.length);
  const hasPwaSignal = Boolean(summary.standaloneOpens);

  const qualityItems: QualityItem[] = [
    {
      label: "الزوار",
      status: hasRealVisitors ? "فعّال" : "انتقالي",
      hint: hasRealVisitors ? "اللوحة تقرأ أجهزة فريدة عبر visitor_id." : "ستتحسن بعد أول زيارات بالإصدار الجديد.",
      tone: hasRealVisitors ? "good" : "watch",
    },
    {
      label: "الجلسات",
      status: hasRealSessions ? "فعّال" : "انتقالي",
      hint: hasRealSessions ? "الاستخدام يُحسب بجلسات مستقلة." : "قد تظهر أرقام قديمة حتى تدخل بيانات جديدة.",
      tone: hasRealSessions ? "good" : "watch",
    },
    {
      label: "المدن",
      status: hasCities ? "مرصودة" : "غير كافية",
      hint: hasCities ? "تُحسب من تحديث الموقع قدر الإمكان." : "تحتاج مستخدمين يضغطون تحديث موقعي.",
      tone: hasCities ? "good" : "neutral",
    },
    {
      label: "PWA",
      status: hasPwaSignal ? "مرصود" : "بانتظار",
      hint: hasPwaSignal ? "هناك فتح كتطبيق من الشاشة الرئيسية." : "يظهر بعد فتح التطبيق المثبت بالإصدار الجديد.",
      tone: hasPwaSignal ? "good" : "neutral",
    },
  ];

  const readout = hasRealVisitors && hasRealSessions ? "القياس الجديد بدأ يعمل" : "اللوحة في مرحلة انتقالية";
  const recommendation = hasRealVisitors && hasRealSessions
    ? "اعتمد زوار اليوم وجلسات اليوم، واترك زيارات الصفحات كقراءة مساندة فقط."
    : "اختبر من جهازين: افتح التطبيق، حدّث الموقع، ثم افتح اللوحة بعد دقيقة.";

  return (
    <div className="relative mt-5 overflow-hidden rounded-[30px] bg-[#F9F3E8] p-4 ring-1 ring-action/10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black text-action">قراءة القائد</p>
          <h3 className="mt-1 text-lg font-black text-primary-text">{readout}</h3>
          <p className="mt-1 text-[11px] font-bold leading-5 text-secondary-text">{recommendation}</p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black text-action shadow-sm">جودة البيانات</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {qualityItems.map((item) => <QualityBadge key={item.label} item={item} />)}
      </div>
    </div>
  );
}
