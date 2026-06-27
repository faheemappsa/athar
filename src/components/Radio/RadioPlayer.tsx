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
      className="grid w-full grid-cols-2 gap-2 rounded-[28px] border border-white/70 bg-[#FBFCFA] p-2.5 shadow-[0_18px_36px_rgba(33,73,63,0.07)] transition-all duration-300 hover:shadow-xl"
    >
      <div className="flex min-h-[5.75rem] flex-col items-center justify-center gap-2 rounded-full border border-[#A8D5C2]/28 bg-white/72 px-3 py-2.5 text-center shadow-sm">
        <div className="flex items-center justify-center gap-1.5">
          <span className="text-lg leading-none" aria-hidden="true">📻</span>
          <p className="text-sm font-extrabold text-primary-text">نداء الإسلام</p>
        </div>
        <Link
          to="/radio"
          className="rounded-full bg-action px-3.5 py-1.5 text-[11px] font-bold text-white shadow-md shadow-action/15 transition hover:opacity-90"
          aria-label="استمع إلى إذاعة نداء الإسلام"
        >
          استمع الآن
        </Link>
      </div>

      <div className="flex min-h-[5.75rem] flex-col items-center justify-center gap-2 rounded-full border border-[#C8A84E]/18 bg-[#F8F0E3]/58 px-3 py-2.5 text-center shadow-sm">
        <div className="flex items-center justify-center gap-1.5">
          <span className="text-lg leading-none" aria-hidden="true">🧭</span>
          <p className="text-sm font-extrabold text-primary-text">تحديد القبلة</p>
        </div>
        <button
          type="button"
          className="rounded-full bg-action px-3.5 py-1.5 text-[11px] font-bold text-white shadow-md shadow-action/15 transition hover:opacity-90"
          aria-label="تحديد اتجاه القبلة"
        >
          حدد القبلة
        </button>
      </div>
    </motion.div>
  );
}
