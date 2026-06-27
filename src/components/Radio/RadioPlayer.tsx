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
      className="grid w-full grid-cols-2 gap-3 rounded-card border border-white/70 bg-[#FBFCFA] p-3 shadow-[0_22px_48px_rgba(33,73,63,0.08)] transition-all duration-300 hover:shadow-2xl"
    >
      <div className="flex min-h-[8.25rem] flex-col justify-between rounded-[24px] border border-[#A8D5C2]/28 bg-white/72 p-3 text-center shadow-sm">
        <div>
          <p className="text-xl leading-none" aria-hidden="true">📻</p>
          <p className="mt-2 text-sm font-extrabold text-primary-text">نداء الإسلام</p>
          <p className="mt-1 text-[11px] font-semibold leading-5 text-secondary-text">المشغل الرسمي داخل أثر</p>
        </div>
        <Link
          to="/radio"
          className="mt-3 rounded-full bg-action px-3 py-2 text-xs font-bold text-white shadow-md shadow-action/15 transition hover:opacity-90"
          aria-label="استمع إلى إذاعة نداء الإسلام"
        >
          استمع الآن
        </Link>
      </div>

      <div className="flex min-h-[8.25rem] flex-col justify-between rounded-[24px] border border-[#C8A84E]/18 bg-[#F8F0E3]/58 p-3 text-center shadow-sm">
        <div>
          <p className="text-xl leading-none" aria-hidden="true">🧭</p>
          <p className="mt-2 text-sm font-extrabold text-primary-text">تحديد القبلة</p>
          <p className="mt-1 text-[11px] font-semibold leading-5 text-secondary-text">اعرف اتجاه القبلة بدقة</p>
        </div>
        <button
          type="button"
          className="mt-3 rounded-full bg-action px-3 py-2 text-xs font-bold text-white shadow-md shadow-action/15 transition hover:opacity-90"
          aria-label="تحديد اتجاه القبلة"
        >
          حدد القبلة
        </button>
      </div>
    </motion.div>
  );
}
