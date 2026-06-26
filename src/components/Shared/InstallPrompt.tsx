import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { trackEvent } from "../../utils/analytics";

const INSTALL_SNOOZE_KEY = "athar-install-snooze-until";
const INSTALL_INSTALLED_KEY = "athar-install-installed";
const DAY = 24 * 60 * 60 * 1000;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

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
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const device = useMemo(getDevice, []);
  const canNativeInstall = device === "android" && Boolean(installEvent);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      trackEvent("pwa_install_prompt_ready", { device });
    };

    const handleInstalled = () => {
      localStorage.setItem(INSTALL_INSTALLED_KEY, "true");
      trackEvent("pwa_app_installed", { device });
      setHidden(true);
    };

    const handleVisibility = () => {
      if (shouldHidePrompt()) setHidden(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    window.addEventListener("focus", handleVisibility);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
      window.removeEventListener("focus", handleVisibility);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [device]);

  if (hidden || isStandalone()) return null;

  const steps =
    device === "ios"
      ? ["افتح أثر من Safari", "اضغط زر المشاركة", "اختر: إضافة إلى الشاشة الرئيسية"]
      : device === "android"
      ? canNativeInstall
        ? ["اضغط زر التثبيت في الأسفل", "وافق على نافذة المتصفح", "سيظهر أثر كتطبيق مستقل"]
        : ["افتح أثر من Chrome", "افتح قائمة المتصفح ⋮", "اختر: تثبيت التطبيق أو إضافة إلى الشاشة الرئيسية"]
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

  const requestInstall = async () => {
    if (!installEvent) return;

    trackEvent("pwa_install_prompt_native_start", { device });
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    trackEvent("pwa_install_prompt_native_choice", { device, outcome: choice.outcome, platform: choice.platform });
    setInstallEvent(null);

    if (choice.outcome === "accepted") {
      localStorage.setItem(INSTALL_INSTALLED_KEY, "true");
      setHidden(true);
    }
  };

  const openPrompt = () => {
    trackEvent("pwa_install_prompt_open", { device, can_native_install: canNativeInstall });
    setOpen(true);
  };

  return (
    <>
      <motion.button
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.45 }}
        onClick={openPrompt}
        className="fixed left-4 right-4 top-[max(0.75rem,env(safe-area-inset-top))] z-[60] mx-auto max-w-sm rounded-[24px] border border-white/55 bg-white/86 px-4 py-3 text-right shadow-[0_16px_36px_rgba(30,27,24,0.12)] backdrop-blur-2xl"
        aria-label="ثبّت أثر كتطبيق على جهازك"
      >
        <span className="block text-sm font-extrabold text-action">🌿 ثبّت أثر كتطبيق على جهازك</span>
        <span className="mt-1 block text-xs font-semibold leading-relaxed text-secondary-text">افتحه بضغطة واحدة واستمتع بتجربة أسرع.</span>
      </motion.button>

      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/30 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm overflow-hidden rounded-[34px] bg-white p-6 shadow-2xl"
          >
            <div className="relative mb-5 overflow-hidden rounded-[28px] bg-action p-5 text-white">
              <p className="text-sm text-white/75">رفيق يومي هادئ</p>
              <h2 className="mt-1 text-2xl font-bold">ثبّت أثر كتطبيق على جهازك</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/80">
                للوصول السريع إلى الأذكار وورد القرآن بتجربة تشبه التطبيقات الأصلية.
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
              {canNativeInstall ? (
                <button onClick={requestInstall} className="rounded-full bg-action py-3 font-bold text-white">
                  تثبيت الآن
                </button>
              ) : (
                <button onClick={understood} className="rounded-full bg-action py-3 font-bold text-white">
                  فهمت
                </button>
              )}
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
