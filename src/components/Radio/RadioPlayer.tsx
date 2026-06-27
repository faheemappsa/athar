import { Coordinates, Qibla } from "adhan";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { appMotion } from "../../config/motion";
import { useSavedLocation } from "../../hooks/useSavedLocation";

const normalizeAngle = (value: number) => ((value % 360) + 360) % 360;
const getQiblaBearing = (lat: number, lng: number) => normalizeAngle(Qibla(new Coordinates(lat, lng)));

export default function RadioPlayer() {
  const surfaceMotion = appMotion.surface;
  const { location, shouldRefresh, daysSinceUpdate } = useSavedLocation();
  const [qiblaOpen, setQiblaOpen] = useState(false);
  const [heading, setHeading] = useState<number | null>(null);
  const hasTrustedLocation = Boolean(location && !shouldRefresh);
  const qiblaBearing = useMemo(() => {
    if (!hasTrustedLocation || !location) return null;
    return getQiblaBearing(location.lat, location.lng);
  }, [hasTrustedLocation, location]);
  const qiblaRotation = qiblaBearing === null ? 0 : normalizeAngle(qiblaBearing - (heading || 0));
  const alignedToQibla = heading !== null && qiblaBearing !== null && Math.min(Math.abs(qiblaRotation), 360 - Math.abs(qiblaRotation)) <= 8;

  useEffect(() => {
    if (!qiblaOpen || !hasTrustedLocation) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const webkitHeading = (event as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading;
      const nextHeading = typeof webkitHeading === "number" ? webkitHeading : event.alpha !== null ? 360 - event.alpha : null;
      if (nextHeading !== null) setHeading(normalizeAngle(nextHeading));
    };

    const requestPermission = async () => {
      const deviceOrientation = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<"granted" | "denied"> };
      if (typeof deviceOrientation.requestPermission === "function") {
        const permission = await deviceOrientation.requestPermission().catch(() => "denied" as const);
        if (permission !== "granted") return;
      }
      window.addEventListener("deviceorientation", handleOrientation, true);
    };

    requestPermission();
    return () => window.removeEventListener("deviceorientation", handleOrientation, true);
  }, [qiblaOpen, hasTrustedLocation]);

  return (
    <>
      <motion.div
        initial={surfaceMotion.initial}
        animate={surfaceMotion.animate}
        transition={surfaceMotion.transition}
        className="grid w-full grid-cols-2 overflow-hidden rounded-card border border-white/70 bg-[#FBFCFA] p-5 shadow-[0_22px_48px_rgba(33,73,63,0.08)] transition-all duration-300 hover:shadow-2xl"
      >
        <div className="flex min-h-[6.75rem] flex-col items-center justify-center gap-3 border-l border-[#A8D5C2]/24 px-3 text-center">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-xl leading-none" aria-hidden="true">📻</span>
            <p className="text-base font-extrabold text-primary-text">نداء الإسلام</p>
          </div>
          <Link
            to="/radio"
            className="rounded-full bg-action px-5 py-2 text-sm font-bold text-white shadow-md shadow-action/15 transition hover:opacity-90"
          >
            تشغيل
          </Link>
        </div>

        <div className="flex min-h-[6.75rem] flex-col items-center justify-center gap-3 px-3 text-center">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-xl leading-none" aria-hidden="true">🧭</span>
            <p className="text-base font-extrabold text-primary-text">تحديد القبلة</p>
          </div>
          <button
            type="button"
            onClick={() => setQiblaOpen(true)}
            className="rounded-full bg-action px-5 py-2 text-sm font-bold text-white shadow-md shadow-action/15 transition hover:opacity-90"
          >
            حدد القبلة
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {qiblaOpen && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-[#21493F]/30 px-5 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="تحديد القبلة"
              className="w-full max-w-[23rem] overflow-hidden rounded-[34px] border border-[#C8A84E]/20 bg-[#FEFCF7] p-5 text-center shadow-[0_28px_70px_rgba(33,73,63,0.22)]"
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
            >
              <div className="mx-auto mb-4 w-fit rounded-full border border-[#A8D5C2]/35 bg-[#EAF6F3]/70 px-4 py-2 text-sm font-extrabold text-[#21493F]">
                🧭 تحديد القبلة
              </div>

              {!hasTrustedLocation ? (
                <div className="rounded-[28px] border border-[#C8A84E]/16 bg-[#F8F0E3]/62 px-5 py-8">
                  <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-white/80 text-4xl shadow-inner">📍</div>
                  <h3 className="mt-5 text-lg font-extrabold text-[#21493F]">حدّث موقعك أولًا</h3>
                  <p className="mx-auto mt-3 max-w-[17rem] text-sm font-semibold leading-7 text-[#8EA29A]">
                    للحصول على اتجاه قبلة دقيق، حدّث موقعك من بطاقة مواقيت الصلاة ثم افتح تحديد القبلة من جديد.
                  </p>
                  {daysSinceUpdate !== null && (
                    <p className="mt-3 text-xs font-bold text-[#C8A84E]">آخر تحديث للموقع قبل {daysSinceUpdate} يوم</p>
                  )}
                </div>
              ) : (
                <>
                  <div className={`relative mx-auto grid h-64 w-64 place-items-center rounded-full border bg-[#F8F0E3]/72 shadow-inner transition-all duration-300 ${alignedToQibla ? "border-[#C8A84E]/50 shadow-[0_0_42px_rgba(200,168,78,0.26)]" : "border-[#C8A84E]/18"}`}>
                    <div className="absolute inset-5 rounded-full border border-[#A8D5C2]/32 bg-[#FBFCFA]/82" />
                    <div className="absolute top-4 text-sm font-extrabold text-[#21493F]">N</div>
                    <div className="absolute bottom-4 text-sm font-extrabold text-[#8EA29A]">S</div>
                    <div className="absolute left-5 text-sm font-extrabold text-[#8EA29A]">W</div>
                    <div className="absolute right-5 text-sm font-extrabold text-[#8EA29A]">E</div>
                    <motion.div
                      className={`absolute left-1/2 top-1/2 h-[6.9rem] w-4 origin-bottom -translate-x-1/2 -translate-y-full rounded-full shadow-[0_12px_26px_rgba(46,125,97,0.22)] transition-colors duration-300 ${alignedToQibla ? "bg-[#1F6E52]" : "bg-[#2E7D61]"}`}
                      animate={{ rotate: qiblaRotation }}
                      transition={{ type: "spring", stiffness: alignedToQibla ? 150 : 100, damping: alignedToQibla ? 20 : 18 }}
                    />
                    <div className={`absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-[#FEFCF7] shadow-md transition-colors duration-300 ${alignedToQibla ? "bg-[#2E7D61]" : "bg-[#C8A84E]"}`} />
                    <div className="relative z-10 mt-28 rounded-full bg-white/88 px-3 py-1 text-xs font-bold text-[#8EA29A]">
                      {qiblaBearing === null ? "حدّث موقعك أولًا" : `القبلة ${Math.round(qiblaBearing)}°`}
                    </div>
                  </div>

                  <p className={`mx-auto mt-4 max-w-[17rem] text-sm font-extrabold leading-7 transition-colors duration-300 ${alignedToQibla ? "text-[#2E7D61]" : "text-[#8EA29A]"}`}>
                    {alignedToQibla ? "أنت الآن في الاتجاه الصحيح" : "وجّه السهم الأخضر نحو القبلة"}
                  </p>
                  <p className="mx-auto mt-2 max-w-[18rem] text-[11px] font-semibold leading-5 text-[#8EA29A]">
                    يعتمد الاتجاه على موقعك المحفوظ في مواقيت الصلاة، وقد تتأثر حركة السهم بمستشعرات الجهاز.
                  </p>
                </>
              )}

              <button
                type="button"
                onClick={() => setQiblaOpen(false)}
                className="mt-5 w-full rounded-full bg-action py-3 text-sm font-extrabold text-white shadow-md shadow-action/15 transition hover:opacity-90"
              >
                تم
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
