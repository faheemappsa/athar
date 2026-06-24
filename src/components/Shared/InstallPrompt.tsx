import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { trackEvent } from "../../utils/analytics";

const INSTALL_SNOOZE_KEY = "athar-install-snooze-until";
const INSTALL_INSTALLED_KEY = "athar-install-installed";
const DAY = 24 * 60 * 60 * 1000;

const isStandalone = () =>
  window.matchMedia?.("(display-mode: standalone)").matches ||
  (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

const getDevice = () => {
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  return "other";
};

const shouldHidePrompt = () => {
  if (isStandalone()) {
    localStorage.setItem(INSTALL_INSTALLED_KEY, "true");
    return true;
  }

  if (localStorage.getItem(INSTALL_INSTALLED_KEY) === "true") return true;

  const snoozeUntil = Number(localStorage.getItem(INSTALL_SNOOZE_KEY) || 0);
  return Number.isFinite(snoozeUntil) && Date.now() < snoozeUntil;
};

const snoozePrompt = (days: number) => {
  localStorage.setItem(INSTALL_SNOOZE_KEY, String(Date.now() + days * DAY));
};

export default function InstallPrompt() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(shouldHidePrompt);
  const device = useMemo(getDevice, []);

  useEffect(() => {
    const handleInstalled = () => {
      localStorage.setItem(INSTALL_INSTALLED_KEY, "true");
      trackEvent("pwa_app_installed", { device });
      setHidden(true);
    };

    const handleVisibility = () => {
      if (shouldHidePrompt()) setHidden(true);
    };

    window.addEventListener("appinstalled", handleInstalled);
    window.addEventListener("focus", handleVisibility);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("appinstalled", handleInstalled);
      window.removeEventListener("focus", handleVisibility);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [device]);

  if (hidden || isStandalone()) return null;

  const steps =
    device === "ios"
      ? ["افتح أثر من سفاري", "اضغط زر المشاركة", "اختر: إضافة إلى الشاشة الرئيسية"]
      : device === "android"
      ? ["افتح قائمة المتصفح ⋮", "اختر: تثبيت التطبيق", "سيظهر أثر كتطبيق مستقل"]
      : ["افتح قائمة المتصفح", "اختر إضافة إلى الشاشة الرئيسية", "ثبّت أثر للوصول اليومي السريع"];

  const dismiss = () => {
    snoozePrompt(7);
    trackEvent("pwa_install_prompt_dismiss", { device, snooze_days: 7 });
    setHidden(true);
  };

  const understood = () => {
    snoozePrompt(4);
    trackEvent("pwa_install_prompt_understood", { device, snooze_days: 4 });
    setOpen(false);
    setHidden(true);
  };

  const openPrompt = () => {
    trackEvent("pwa_install_prompt_open", { device });
    setOpen(true);
  };

  return (
    <>
      <motion.button
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.5 }}
        onClick={openPrompt}
        className="fixed left-4 right-4 top-3 z-[60] mx-auto max-w-sm rounded-full bg-white/95 px-5 py-3 text-sm font-bold text-action shadow-xl shadow-action/10 backdrop-blur"
      >
        🌿 ثبّت أثر كتطبيق يومي
      </motion.button>

      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/30 px-4 pb-5 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm overflow-hidden rounded-[34px] bg-white p-6 shadow-2xl"
          >
            <div className="relative mb-5 overflow-hidden rounded-[28px] bg-action p-5 text-white">
              <p className="text-sm text-white/75">رفيق يومي هادئ</p>
              <h2 className="mt-1 text-2xl font-bold">خلّ أثر قريب منك</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/80">
                ثبّته على الشاشة الرئيسية للأذكار وورد القرآن ومشاركة الأثر بسهولة.
              </p>
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
              <button onClick={understood} className="rounded-full bg-action py-3 font-bold text-white">
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
