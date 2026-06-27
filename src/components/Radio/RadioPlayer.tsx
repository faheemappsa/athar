import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { appMotion } from "../../config/motion";
import { useSavedLocation } from "../../hooks/useSavedLocation";

const KAABA = { lat: 21.4225, lng: 39.8262 };

const toRad = (value: number) => (value * Math.PI) / 180;
const toDeg = (value: number) => (value * 180) / Math.PI;
const normalizeAngle = (value: number) => ((value % 360) + 360) % 360;

const getQiblaBearing = (lat: number, lng: number) => {
  const userLat = toRad(lat);
  const deltaLng = toRad(KAABA.lng - lng);
  const kaabaLat = toRad(KAABA.lat);
  const y = Math.sin(deltaLng);
  const x = Math.cos(userLat) * Math.tan(kaabaLat) - Math.sin(userLat) * Math.cos(deltaLng);
  return normalizeAngle(toDeg(Math.atan2(y, x)));
};

export default function RadioPlayer() {
  const surfaceMotion = appMotion.surface;
  const { location } = useSavedLocation();
  const [qiblaOpen, setQiblaOpen] = useState(false);
  const [heading, setHeading] = useState<number | null>(null);
  const qiblaBearing = useMemo(() => getQiblaBearing(location?.lat || 24.5247, location?.lng || 39.5692), [location?.lat, location?.lng]);
  const qiblaRotation = normalizeAngle(qiblaBearing - (heading || 0));

  useEffect(() => {
    if (!qiblaOpen) return;

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
  }, [qiblaOpen]);

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

              <div className="relative mx-auto grid h-64 w-64 place-items-center rounded-full border border-[#C8A84E]/18 bg-[#F8F0E3]/72 shadow-inner">
                <div className="absolute inset-5 rounded-full border border-[#A8D5C2]/32 bg-[#FBFCFA]/82" />
                <div className="absolute top-4 text-sm font-extrabold text-[#21493F]">N</div>
                <div className="absolute bottom-4 text-sm font-extrabold text-[#8EA29A]">S</div>
                <div className="absolute left-5 text-sm font-extrabold text-[#8EA29A]">W</div>
                <div className="absolute right-5 text-sm font-extrabold text-[#8EA29A]">E</div>
                <motion.div
                  className="absolute left-1/2 top-1/2 h-[6.9rem] w-4 origin-bottom -translate-x-1/2 -translate-y-full rounded-full bg-[#2E7D61] shadow-[0_12px_26px_rgba(46,125,97,0.22)]"
                  animate={{ rotate: qiblaRotation }}
                  transition={{ type: "spring", stiffness: 100, damping: 18 }}
                />
                <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-[#FEFCF7] bg-[#C8A84E] shadow-md" />
                <div className="relative z-10 mt-28 rounded-full bg-white/88 px-3 py-1 text-xs font-bold text-[#8EA29A]">
                  {heading === null ? "حرّك جهازك قليلًا" : `القبلة ${Math.round(qiblaBearing)}°`}
                </div>
              </div>

              <p className="mx-auto mt-4 max-w-[17rem] text-xs font-semibold leading-6 text-[#8EA29A]">
                حرّك هاتفك حتى يشير السهم الأخضر إلى اتجاه القبلة.
              </p>

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
