export default function InstallMetricsCard({ installs, opens }: { installs: number; opens: number }) {
  const conversion = installs > 0 ? Math.round((opens / installs) * 100) : 0;

  return (
    <div className="rounded-[30px] bg-primary-bg p-4">
      <h3 className="mb-3 text-base font-black">التطبيق المثبت</h3>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl bg-white p-3">
          <p className="text-2xl font-black text-action">{installs}</p>
          <p className="text-[10px] font-bold text-secondary-text">تم التثبيت</p>
        </div>
        <div className="rounded-2xl bg-white p-3">
          <p className="text-2xl font-black text-action">{opens}</p>
          <p className="text-[10px] font-bold text-secondary-text">فتح كتطبيق</p>
        </div>
        <div className="rounded-2xl bg-white p-3">
          <p className="text-2xl font-black text-action">{conversion}%</p>
          <p className="text-[10px] font-bold text-secondary-text">التحويل</p>
        </div>
      </div>
    </div>
  );
}
