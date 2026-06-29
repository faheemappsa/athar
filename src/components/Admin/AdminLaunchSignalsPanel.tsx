import { useEffect, useState } from "react";
import { fetchSupabaseAnalyticsSummary } from "../../utils/supabaseAnalytics";
import InstallMetricsCard from "./InstallMetricsCard";
import { localizeAdminRows } from "./adminLabels";

type Row = { name: string; value: number };

const MiniBars = ({ rows }: { rows: Row[] }) => {
  const safe = rows.length ? localizeAdminRows(rows) : [{ name: "لا توجد بيانات بعد", value: 0 }];
  const max = Math.max(1, ...safe.map((row) => row.value));

  return (
    <div className="space-y-3">
      {safe.map((row) => (
        <div key={row.name}>
          <div className="mb-1 flex items-center justify-between text-sm font-bold">
            <span>{row.name}</span>
            <span>{row.value}</span>
          </div>
          <div className="h-3 rounded-full bg-action/10">
            <div className="h-3 rounded-full bg-action" style={{ width: `${Math.max(5, (row.value / max) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default function AdminLaunchSignalsPanel() {
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof fetchSupabaseAnalyticsSummary>>>(null);

  useEffect(() => {
    fetchSupabaseAnalyticsSummary().then(setSummary);
  }, []);

  if (!summary) return null;

  return (
    <section className="rounded-[34px] bg-white p-5 shadow-xl ring-1 ring-action/10">
      <h2 className="text-xl font-black text-primary-text">مؤشرات الإطلاق</h2>
      <p className="mt-1 text-xs leading-6 text-secondary-text">مختصر عربي لأهم الأشياء التي تهمك الآن.</p>
      <div className="mt-5 grid gap-4">
        <InstallMetricsCard installs={summary.installs || 0} opens={summary.standaloneOpens || 0} />
        <div className="rounded-[30px] bg-primary-bg p-4">
          <h3 className="mb-3 text-base font-black">أهم الأحداث بالعربي</h3>
          <MiniBars rows={summary.topEvents || []} />
        </div>
      </div>
    </section>
  );
}
