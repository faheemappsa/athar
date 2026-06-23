import { useMemo, useState } from "react";
import { motion } from "framer-motion";

const isStandalone = () =>
  window.matchMedia?.("(display-mode: standalone)").matches ||
  (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

const getDevice = () => {
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  return "other";
};

export default function InstallPrompt() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(() => localStorage.getItem("athar-install-hidden") === "true");
  const device = useMemo(getDevice, []);

  if (hidden || isStandalone()) return null;

  const steps =
    device === "ios"
      ? ["اضغط زر المشاركة في سفاري", "اختر: إضافة إلى الشاشة الرئيسية", "اضغط إضافة وسيظهر أثر كتطبيق"]
      : device === "android"
      ? ["افتح قائمة المتصفح ⋮", "اختر: تثبيت التطبيق أو إضافة للشاشة الرئيسية", "اضغط تثبيت وسيظهر أثر كتطبيق"]
      : ["افتح قائمة المتصفح", "اختر إضافة إلى الشاشة الرئيسية", "ثبّت أثر للوصول السريع"];

  const dismiss = () => {
    localStorage.setItem("athar-install-hidden", "true");
    setHidden(true);
  };

  return (
    <>
      <motion.button
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.5 }}
        onClick={() => setOpen(true)}
        className="fixed left-4 right-4 top-3 z-[60] mx-auto max-w-sm rounded-full bg-white/95 px-5 py-3 text-sm font-bold text-action shadow-xl shadow-action/10 backdrop-blur"
      >
        ✨ خلّ أثر كتطبيق في جوالك
      </motion.button>

      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/30 px-4 pb-5 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm overflow-hidden rounded-[34px] bg-white p-6 shadow-2xl"
          >
            <div className="relative mb-5 overflow-hidden rounded-[28px] bg-action p-5 text-white">
              <p className="text-sm text-white/75">تجربة أجمل</p>
              <h2 className="mt-1 text-2xl font-bold">ثبّت أثر كتطبيق</h2>
              <p className="mt-2 text-sm text-white/80">يفتح أسرع ويظهر على شاشة جوالك مثل التطبيقات.</p>
              <div className="absolute -bottom-10 left-0 h-20 w-2/3 rounded-tr-[90px] bg-white/20" />
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10" />
            </div>

            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={step} className="flex items-center gap-3 rounded-[22px] bg-primary-bg p-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-sm font-bold text-action shadow-sm">
                    {index + 1}
                  </span>
                  <p className="text-sm font-semibold text-primary-text">{step}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button onClick={() => setOpen(false)} className="rounded-full bg-action py-3 font-bold text-white">
                فهمت
              </button>
              <button onClick={dismiss} className="rounded-full bg-primary-bg py-3 font-bold text-secondary-text">
                لاحقاً
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
