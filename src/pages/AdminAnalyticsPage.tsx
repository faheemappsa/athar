import { useState } from "react";
import SupabaseReportsPanel from "../components/Admin/SupabaseReportsPanel";

const ADMIN_PIN_KEY = "athar-admin-unlocked";
const DEFAULT_PIN = "athar1446";

export default function AdminAnalyticsPage() {
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem(ADMIN_PIN_KEY) === "1");

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
              <p className="mt-2 text-xs leading-6 text-secondary-text">بيانات حية من Supabase. التحديث من غرفة القيادة بالأسفل.</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700">خاص</span>
          </div>
        </header>

        <SupabaseReportsPanel />
      </div>
    </div>
  );
}
