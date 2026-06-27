import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { appMotion } from "../../config/motion";

export default function RadioPlayer() {
  const surfaceMotion = appMotion.surface;

  return (
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
          className="rounded-full bg-action px-5 py-2 text-sm font-bold text-white shadow-md shadow-action/15 transition hover:opacity-90"
        >
          حدد القبلة
        </button>
      </div>
    </motion.div>
  );
}
