export default function InstallMetricsCard({ installs, opens }: { installs: number; opens: number }) {
  return (
    <div className="rounded-[30px] bg-primary-bg p-4">
      <h3 className="mb-3 text-base font-black">التطبيق المثبت • آخر 7 أيام</h3>
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="rounded-2xl bg-white p-3">
          <p className="text-2xl font-black text-action">{installs}</p>
          <p className="text-[10px] font-bold text-secondary-text">تثبيت مؤكد</p>
        </div>
        <div className="rounded-2xl bg-white p-3">
          <p className="text-2xl font-black text-action">{opens}</p>
          <p className="text-[10px] font-bold text-secondary-text">مرات فتح كتطبيق</p>
        </div>
      </div>
      <p className="mt-3 text-[11px] font-bold leading-5 text-secondary-text">لا نحسب نسبة تحويل بين الرقمين؛ فتح التطبيق قد يتكرر عدة مرات من نفس المستخدم.</p>
    </div>
  );
}