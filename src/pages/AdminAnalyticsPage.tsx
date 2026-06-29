import { useMemo, useState } from "react";

const ADMIN_PIN_KEY = "athar-admin-unlocked";
const DEFAULT_PIN = "athar1446";

type Metric = {
  label: string;
  value: string;
  hint: string;
};

const demoMetrics: Metric[] = [
  { label: "زيارات اليوم", value: "—", hint: "ينتظر ربط Supabase" },
  { label: "المشاركات", value: "—", hint: "share events" },
  { label: "التثبيت كتطبيق", value: "—", hint: "PWA install" },
  { label: "العميل رقم 1", value: "—", hint: "high intent users" },
];

const trend = [18, 32, 28, 44, 52, 49, 63];
const devices = [
  { name: "iPhone", value: 62 },
  { name: "Android", value: 27 },
  { name: "Desktop", value: 11 },
];
const events = [
  { name: "فتح الرئيسية", value: 86 },
  { name: "مشاركة البطاقة", value: 34 },
  { name: "فتح المصحف", value: 28 },
  { name: "الأذكار", value: 22 },
];

const maxTrend = Math.max(...trend);

const Sparkline = () => {
  const points = trend
    .map((value, index) => {
      const x = 18 + index * 44;
      const y = 106 - (value / maxTrend) * 78;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 310 130" className="h-36 w-full overflow-visible">
      <path d="M18 106H292" stroke="currentColor" strokeOpacity="0.08" strokeWidth="2" />
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      {trend.map((value, index) => {
        const x = 18 + index * 44;
        const y = 106 - (value / maxTrend) * 78;
        return <circle key={index} cx={x} cy={y} r="5" fill="currentColor" />;
      })}
    </svg>
  );
};

const BarList = ({ rows }: { rows: { name: string; value: number }[] }) => {
  const max = Math.max(...rows.map((row) => row.value));
  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <div key={row.name}>
          <div className="mb-2 flex items-center justify-between text-sm font-bold">
            <span>{row.name}</span>
            <span>{row.value}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-action/10">
            <div className="h-full rounded-full bg-action" style={{ width: `${(row.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default function AdminAnalyticsPage() {
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem(ADMIN_PIN_KEY) === "1");

  const adminUrl = useMemo(() => `${window.location.origin}/admin/athar`, []);

  const login = () => {
    if (pin.trim() === DEFAULT_PIN) {
      localStorage.setItem(ADMIN_PIN_KEY, "1");
      setUnlocked(true);
    }
  };

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-primary-bg px-5 py-10 font-arabic text-primary-text">
        <div className="mx-auto max-w-md rounded-[32px] bg-white p-6 text-center shadow-xl">
          <p className="text-4xl">📊</p>
          <h1 className="mt-4 text-2xl font-extrabold">لوحة أثر الخاصة</h1>
          <p className="mt-2 text-sm leading-7 text-secondary-text">أدخل رمز المتابعة لفتح صفحة التقارير.</p>
          <input
            value={pin}
            onChange={(event) => setPin(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && login()}
            placeholder="رمز الدخول"
            className="mt-5 w-full rounded-2xl border border-action/15 bg-primary-bg px-4 py-3 text-center font-bold outline-none focus:border-action"
          />
          <button onClick={login} className="mt-4 w-full rounded-full bg-action px-5 py-3 font-extrabold text-white shadow-lg shadow-action/20">
            دخول اللوحة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-bg px-4 pb-12 pt-6 font-arabic text-primary-text">
      <div className="mx-auto max-w-md space-y-4">
        <header className="rounded-[32px] bg-white p-5 shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-action">لوحة المتابعة الخاصة</p>
              <h1 className="mt-1 text-2xl font-extrabold">تقارير أثر</h1>
              <p className="mt-2 text-xs leading-6 text-secondary-text">هذه الصفحة جاهزة للربط مع Supabase. حاليًا تعرض هيكل التقارير والمؤشرات المطلوبة.</p>
            </div>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-700">بانتظار الربط</span>
          </div>
          <div className="mt-4 rounded-2xl bg-primary-bg p-3 text-xs font-bold text-secondary-text break-all">{adminUrl}</div>
        </header>

        <section className="grid grid-cols-2 gap-3">
          {demoMetrics.map((metric) => (
            <div key={metric.label} className="rounded-[28px] bg-white p-4 shadow-lg">
              <p className="text-xs font-bold text-secondary-text">{metric.label}</p>
              <p className="mt-2 text-3xl font-extrabold text-action">{metric.value}</p>
              <p className="mt-1 text-[11px] font-semibold text-secondary-text/80">{metric.hint}</p>
            </div>
          ))}
        </section>

        <section className="rounded-[32px] bg-white p-5 shadow-xl">
          <h2 className="text-lg font-extrabold">اتجاه الزيارات</h2>
          <p className="mt-1 text-xs text-secondary-text">سيعرض زيارات آخر 7 أيام بعد الربط.</p>
          <div className="mt-4 text-action"><Sparkline /></div>
        </section>

        <section className="rounded-[32px] bg-white p-5 shadow-xl">
          <h2 className="text-lg font-extrabold">الأجهزة</h2>
          <p className="mt-1 text-xs text-secondary-text">نوع الجهاز والمتصفح بعد جمع الأحداث.</p>
          <div className="mt-5"><BarList rows={devices} /></div>
        </section>

        <section className="rounded-[32px] bg-white p-5 shadow-xl">
          <h2 className="text-lg font-extrabold">أهم الأحداث</h2>
          <p className="mt-1 text-xs text-secondary-text">مشاركة، تثبيت، فتح كتطبيق، وتنقلات المستخدم.</p>
          <div className="mt-5"><BarList rows={events} /></div>
        </section>

        <section className="rounded-[32px] border border-dashed border-action/25 bg-white/70 p-5 shadow-lg">
          <h2 className="text-lg font-extrabold">المطلوب لاحقًا للربط</h2>
          <p className="mt-2 text-sm leading-7 text-secondary-text">أرسل SUPABASE_URL و SUPABASE_ANON_KEY و ADMIN_PIN، وبعدها تتحول هذه الصفحة من نموذج جاهز إلى لوحة بيانات حية.</p>
        </section>
      </div>
    </div>
  );
}
