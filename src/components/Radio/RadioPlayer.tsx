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
      className="flex w-full items-center justify-between gap-3 rounded-card border border-white/70 bg-[#FBFCFA] p-5 shadow-[0_22px_48px_rgba(33,73,63,0.08)] transition-all duration-300 hover:shadow-2xl"
    >
      <div className="min-w-0">
        <p className="text-xs font-medium text-secondary-text">المشغل الرسمي داخل أثر</p>
        <p className="truncate text-base font-bold text-primary-text">📻 نداء الإسلام</p>
      </div>
      <Link
        to="/radio"
        className="shrink-0 rounded-full bg-action px-5 py-2 text-base font-bold text-white shadow-md shadow-action/15 transition hover:opacity-90"
        aria-label="تشغيل إذاعة نداء الإسلام"
      >
        تشغيل
      </Link>
    </motion.div>
  );
}
